---
author: Qi Liu
pubDatetime: 2024-09-06
title: C++ String Implementation Details
featured: true
draft: false
tags:
  - cpp
  - seastar
description: C++ string implementation has changed a lot compared to the past.
---

&emsp;&emsp;2021年的秋冬之际，我入职了一家非常有志向、非常牛逼的、要做世界上最先进的 OLAP
Database ([ClapDB](https://clapdb.com)) 的公司。由于工作的需要，我开始学习、研究和使用
C++，到现在已经快三年了。在这三年的时间里我一直也在研究如何写出性能最好的程序。当然，这是一个
很大的话题，我也希望可以通过一些的文章来总结和分享我的经验。那么就先从C++的实现来开始。

&emsp;&emsp;C++中的string有很多种实现。当然也不只是string、很多数据结构都有多种的实现。如果
你的程序是用C++来写的，那么我敢肯定，大概率都研究过使用的各种数据结构应该适合使用哪种实现。我很
少听说哪家公司在追求性能的道路上还去使用 STL 的。（也不一定了，标准库也是在进步，string 的实现其实足够好了，
[seastar甚至在考虑用`std::string`代替`seastar::sstring`](https://github.com/scylladb/seastar/issues/634)）
这也是C++的魅
力之一，既然用了C++，那么就可以根据实际情况来把性能抠到极致。

&emsp;&emsp;下面是我在研究C++的字符串实现时参考的一些实现和资料

- `std::string` from GCC's libstdc++
- `std::string` from LLVM's libc++
- [`folly::fbstring` from Facebook's Folly library](https://github.com/facebook/folly/blob/main/folly/docs/FBString.md)
- [`seastar::sstring` from ScyllaDB's Seastar framework](https://github.com/scylladb/seastar/blob/master/include/seastar/core/sstring.hh)
  > 我司使用的是 seastar 这个C++框架，所以我还是蛮喜欢`seastar::sstring`的，它提供了和`seastar::temporary_buffer<char>`的完美结合。  
  > 上面几种实现基本都是基于 Small String Optimization (SSO) 的实现。（`std::string`是指C++11之后的实现，之前的版本用的是COW）  
  > 其他的一些差异就是 memory layout以及细节上的优化。
- [CppCon 2016: Nicholas Ormrod “The strange details of std::string at Facebook"](https://www.youtube.com/watch?v=kPR8h4-qZdk)
- [Exploring std::string](https://shaharmike.com/cpp/std-string/)
- [jank's new persistent string is fast](https://jank-lang.org/blog/2023-12-30-fast-string/)
- [Why COW was deemed ungood for std::string · GitHub](https://gist.github.com/alf-p-steinbach/c53794c3711eb74e7558bb514204e755)
- [Libc++'s Implementation of std::string | Hacker News](https://news.ycombinator.com/item?id=22198158)
- [libc++’s implementation of std::string | Joel Laity](https://joellaity.com/2020/01/31/string.html)
  > 为什么 libc++ 和 libstdc++ 的源代码实现都很难阅读？  
  > Optimized、Templates、Portable（各种宏）、Undocumented...

## String 实现中的两大主流技术

- **COW**（Copy-On-Write, using a reference counting. 是被淘汰的技术）
  - 很多早期的实现都是基于 COW 的。
  - 线程的使用导致性能并不好。（这个很容易理解，推荐大家深入学习一下 [MESI](https://en.wikipedia.org/wiki/MESI_protocol)，可以更好地理解）
  - 早期的 C++ STL中采用的这种技术，C++11之后就都不再使用了。
- **SSO** （Small String Optimization，目前主流的实现）
  - short string 避免了额外一次的 heap allocation

### COW被淘汰了，SSO胜出了？

&emsp;&emsp;在实践中，COW string 被证明很容易出问题（我们之前搞 string 的时候也是想搞 COW，
因为 seastar 的特点就是单个shard上像 Node.js 一样是单线程的，完全不需要 atomics,
但是如果跨核实现起来就会非常复杂。）以及慢。

> 某种程度上这也是软硬件的发展导致的结果。在不需要考虑 multi-threading 的时代，COW还是挺香的。

&emsp;&emsp;但是 `FBstring` 就是一个例外，可以叫作 hybrid string，同时使用了 COW 和 SSO。

- Small strings (<= 23 chars) are stored in-situ without memory allocation.
- Medium strings (24 - 255 chars) are stored in malloc-allocated memory and copied eagerly.
  > SSO
- Large strings (> 255 chars) are stored in malloc-allocated memory and copied lazily.
  > COW

&emsp;&emsp;`FBstring` 确实牛逼！但是并不适合我们（seastar）

## SSO Implementation details

&emsp;&emsp;SSO 的核心就是使用 union 来实现 short string 的存储以及 long string
的 meta data 的存储。这里我使用 [seastar::string](https://github.com/scylladb/seastar/blob/master/include/seastar/core/sstring.hh#L82) 的源码来展示：

```cpp
template <typename char_type, typename Size, Size max_size, bool NulTerminate = true>
class basic_sstring {
    union contents {
        struct external_type {
            char_type* str;
            Size size;
            int8_t pad;
        } external;
        struct internal_type {
            char_type str[max_size];
            int8_t size;
        } internal;
    } u;
//...
};

#ifdef SEASTAR_SSTRING
// Older std::string used atomic reference counting and had no small-buffer-optimization.
// At some point the new std::string ABI improved -- no reference counting plus the small
// buffer optimization. However, aliasing seastar::sstring to std::string still ends up
// with a small performance degradation. (FIXME?)
using sstring = basic_sstring<char, uint32_t, 15>;
#else
using sstring = std::string;
#endif
```

- 如果是 short string，那么就会使用 internal_type 来存储
- 如果是 long string，那么就会使用 external_type 来存储。

&emsp;&emsp;下面再使用两张 libc++ 的实现的图来说明一下分别保存 short string 和 long string 的情况：

- Long String Mode
  ![Long string Mode of libc++'s string](@assets/images/cpp/libc++_string_long_string_mode.png)

- Short String Mode
  ![Short string Mode of libc++'s string](@assets/images/cpp/libc++_string_short_string_mode.png)

&emsp;&emsp;既然有两种mode，那么就有一个问题：string自己是如何知道自己用的是 internal 还是 external 呢？

- 对于 seastar 来说，`u.size >=0`就是internal。这个在构建的时候会判断如果external就把pad设置为-1
- fbstring 使用的是也是 lsb
- libc++的是在lsb(it) of lsb(yte)
  - 简单来说就是，1个 bit 决定是 short 还是 long，剩下的7个 bit 用来保存 size （2^7 = 128够用了）。

### Short Mode Max Size

&emsp;&emsp;对于不同的实现，short mode 能保存的字符串的大小(`sizeof(string)`)也是不一样的。

- seastar 是 15
- libc++ 是 22
- fbstring 是 23 （kill the null terminator）

> 比如某个场景，限制了字符串的长度，我们可以自己来指定 short string mode 的 max size. 这也是 c++ 强大的原因。  
> 没有人会设置一个无比大的 max size 吧？像 seastar，max size 是不能超过 `int8_t` 的

### Growth Strategy

&emsp;&emsp;不管是 2x 还是多少，string 也是一种容器。对于容器来说，如果当前的空间不够用了，就需要去分配新的、更大的空间，然后把原来的拷贝过去。
频繁的 grow 操作是非常低效的。一般来说，在使用的时候要注意，如果可能，提前 reserve。

## Seastar String

我们后来就放弃了自己实现的string，转而使用 `seastar::sstring`。我给 sstring 提供的方法排了一个天梯榜。
TO 就是优先使用的，最高效的。T1 也能用，剩下没有排进来的尽量别用。

### TO

- `uninitialized_string(size_t size)` 返回没有初始化的 sstring
  - 对应构造函数 `basic_sstring(initialized_later, size_t size)`
  - 就是没有初始化的string，先分配空间 + 设置 `\0` (null terminator)
- `basic_sstring(const char_type* x, size_t size)` 构建函数其中一个
  - 很高效的 copy，直接在 internal 和 external 上操作。
  - **比 uninitialized_string 多一个std::copy**
- `release() &&` 是我最喜欢的，把 string 的 buffer 直接给了`temporary_buffer<string>`

### T1

- `make_sstring`
  - uninitialized_string(N 个 string)，然后 copy
  - 用这个要比使用 append 或者 `+` 要好
- `append`
  1. initialized_later 一个 buf
  2. 把原来的拷贝过来
  3. 新增的部分拷贝
- `to_sstring` 是直接 std::copy
