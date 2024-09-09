---
author: Qi Liu
pubDatetime: 2024-09-09
title: "Why C++ CRTP?"
featured: true
draft: false
tags:
  - cpp
description: CRTP is a powerful design pattern in C++ that allows for static polymorphism and code reuse.
---

## Table of contents

## Introduction

&emsp;&emsp;我在加入 ClapDB 之后做的第一个项目去为一个开源的 encoding 项目添加功能来满足我们自己的需求。
这个最初的项目就是 [chronoxor/FastBinaryEncoding](https://github.com/chronoxor/FastBinaryEncoding)
（后来陆陆续续又加了很多其他的功能，做了很多的修改，成了另外一个项目 [clapdb/FBE](https://github.com/clapdb/FBE)，这是后话了）。
这个项目是一个基于 template 技术去实现的 encoding。我当时要做的是添加上循环引用的功能。
用过 c++ template 的都知道，template 的 T 是不允许使用 incomplete type 的。所以在 template 之上是没有办法去实现的。
后来我的做法就是重新实现了一版，使用的是基于指针的技术。也就是多态，即父类指针指向子类对象。

&emsp;&emsp;后来在工作中，接触到了 CRTP 这个技术。第一眼看到 CRTP 的时候就很好奇，为什么有两种不同的多态技术？

## 实现多态的两种方式

&emsp;&emsp;在 C++ 中，实现多态有两种方式：

- 动态多态（runtime polymorphism）：父类指针 + 虚函数
- 静态多态（compile-time polymorphism）：CRTP

## CRTP aka Curiously Recurring Template Pattern

https://en.cppreference.com/w/cpp/language/crtp

&emsp;&emsp;中文名字我觉得很拗口，叫作**奇异递归模板模式**，一开始我以为是数学家搞出来的，完全不之所云。
。和基于指针的多态不同，CRTP 是一种静态多态。它通过模板参数来实现多态，而不是通过虚函数。其实就是把派生类作为基类的模板参数。

> 动态多态的问题是什么？性能。
>
> 1. 虚函数表的查找是有开销的。
> 2. virtual methods 无法被 inline
> 3. Additional pointer per object (8 bytes per object)

&emsp;&emsp;CRTP 是一种静态多态，它通过模板参数来实现多态（模板是预处理技术），而不是通过虚函数。
CRTP的优点正式因为其是基于模板的，可以在预编译的时候展开。compiler 可以进行 inline functions 的优化。
从而实现 static dispatch（性能显著好于 virtual calls）。在内存上也会没有了 8 bytes 的指针。

&emsp;&emsp;凡事都有两面，CRTP 的缺点也很明显：

1. 不能做运行时动态绑定
2. 大量使用 template 会导致代码难以阅读（见仁见智）
3. 让生成代码变得庞大、臃肿。

&emsp;&emsp;还有一个缺是和性能无关的。就是它会让添加新的功能变得复杂。这一条是我在实际使用中遇到的。
本来想限制一个 class 变臃肿，结果 CRTP 却让自己很难去添加新的功能。

&emsp;&emsp;因为有实实在在的性能收益，所以 CRTP 并非纯炫技的技术。

### How to CRTP

```cpp
template <class T>
struct Base
{
    void interface()
    {
        // ...
        static_cast<T*>(this)->implementation();
        // ...
    }

    static void static_func()
    {
        // ...
        T::static_sub_func();
        // ...
    }
};

struct Derived : Base<Derived>
{
    void implementation()；

    static void static_sub_func();
};
```

### CRTP + Abstract class

&emsp;&emsp;`Derived` 除了继承 `Base<Derived>` 之外，还可以继承一个Abstract Class用来做 Interface。
