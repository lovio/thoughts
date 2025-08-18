---
author: "Qi Liu"
pubDatetime: 2025-08-18
title: "Book Review: A Philosophy of Software Design in the Age of AI"
featured: true
tags:
  - Book
  - Software Design
description: "A review of John Ousterhout's seminal work on software design principles"
---

> Great Design, all pays back

我看过不少软件开发相关的书籍，其中有两本，我认为是对我的职业生涯是产生了重要影响的。一本书《Ruby元编程》，另一本就是 John Ousterhout 的这本《A Philosophy of Software Design》。前者是我的职业启蒙书，它让我真正掌握了一门语言。而后者，则是让我对软件开发升了一个境界。当然了，第二本书是我在工作了六七年之后读的。如果没有这么多年的开发经验，可能也无法理解这本书。

大概是在 2020 年底的时候，我在学习 Raft，看论文的作者有 John Ousterhout，不查不知道，一查发现，这个老头子不简单啊！然后就找到了这本书。阅读之后更是醍醐灌顶。最近的工作又让我对 complexity 有了进一步的理解。我想把这本书分享给所有的朋友。尤其是在当下这个 AI 时代，在这个 LLM 可以快速吐出大量代码的时代。这本书涵盖的内容非常之多，我也不指望自己能在这一篇中说明白。我就挑些我觉得重要的。

## 相关的资料

- [《A Philosophy of Software Design》](https://www.amazon.sg/Philosophy-Software-Design-2nd/dp/173210221X) by John Ousterhout. 现在已经出到第二版了，我当时看的还是第一版。
- [The Philosophy of Software Design – with John Ousterhout](https://www.youtube.com/watch?v=lz451zUlF-k) 这是最近（2025-04-09）的一个采访。非常精彩，强推。
- [Big Techday 24: Can Great Programmers Be Taught? - Prof. Dr. John Ousterhout](https://www.youtube.com/watch?v=fPIuFo9V3Lk)
- [A Philosophy of Software Design | John Ousterhout | Talks at Google](https://www.youtube.com/watch?v=bmSAYlu0NcY)

建议看前两个，第三个也还行。最后一个确实有点年代久远（Aug 1, 2018）了，但主题内容并不过时。这三个视频时间跨越非常之大，但变化并不大，就像 AWS S3 的接口一样稳定。

## 关于作者 John Ousterhout

[Ousterhout's web page at Stanford University](https://engineering.stanford.edu/people/john-ousterhout)

这个老头子非常厉害，是 TCL 语言和 Raft 的作者。从学界到工业界，后来自己创业。自己公司被收购后又回到了学校教书。其他的成就我不是很了解，只是 Raft 的作者这一点就非常牛逼了。最近的访谈中，我了解到老爷子最近大半年一直在忙着给 Linux 贡献代码，他希望把他的一个博士生的研究成果落地。一个 70 岁的老头子都在写代码，真乃吾辈楷模。

## It's all about Complexity

本书的核心主旨就是 Complexity。理解 complexity 是最重要的。

如果用一个词来描述 computer science，那应该是什么呢？这是老爷子提出的一个问题。他问了 Don Knuth，得到的答案是：**layers of abstraction**。老爷子自己的答案是 **problem decomposition**，也就是把一个复杂的问题分解。

1. The greatest limitation in writing software is our ability to understand the systems we are creating
2. 战胜Complexity的两种办法
   1. Making code simpler and more obvious
   2. Encapsulate
3. 瀑布模型（waterfall model）最大的问题就是The entire system is designed at once, during the design phase
4. 增量开发意味着软件设计从未结束
   > Incremental development means that software design is never done. **Design happens continuously over the life of a system** developer should always be thinking about design issues. Incremental development also means continuous redesign
5. 阅读这本书最好的办法就是和code review在一起。设计/实现复杂的地方更容易存在优化的空间。

### Nature of Complexity

如何定义复杂呢？ 复杂的症状有哪些呢？

> Complexity Comes from **an accumulation of dependencies and obscurity**. As complexity increases, it leads to change amplification, cognitive load, and unknown unknowns. As a result, it takes more code modifications to implement each new feature. In addition, developers spend more time acquiring enough information to make the change safely, and in the worst case, they can’t even find all the information they need. **The bottom line is that complexity makes it difficult and risky to modify an existing code base**

Complexity is anything related to the structure of a software system that makes it hard to understand and modify the system

- 难以理解
- 难以修改

整体复杂度是各部分复杂度之和？
**评判的标准应该是readers而不是writers**
你是作者，你觉得你写的很好，这不是错觉。
需要其他人来评判

#### Symptoms of complexity 三大症状

- Change amplification
  > 一个看似简单的改变但其实需要在很多地方去修改。好的设计会让修改变得很容易。
- Cognitive load 认知

  > How much a developer needs to know in order to complete a task
  >
  > 拿语言来举例，比如C语言分配内存，你在使用的时候就不能忘记释放内存，这就是你写C 的 cognitive load。C++ 可以通过 class 的析构函数来做好封装，你的 cognitive load 就是设计好的你的 class。对于golang或者rust这种自动内心管理的语言就没有这个问题。
  >
  > 常见的 cognitive load
  >
  > - APIs with many methods
  > - global variables
  > - inconsistencies
  > - dependencies between modules
  >
  > 某种程度上来说，微服务也是增加了 cognitive load。 **有的时候更多的代码会比更少的代码更简单**，细品。

- Unknown unknowns
  > 不清楚需要改多少以及不清楚需要什么知识储备。
  >
  > 再比如前人留下的代码，没有文档、没有注释的，不知道为何这样设计，有什么坑。

#### Causes of complexity

- **dependencies**
- **obscurity**
  - naming
  - documentation

## My Thoughts Mixed

除了 Complexity 这个核心之外，这本书涵盖的内容很多。下面我就直接列一下我感兴趣的点了。其中结合了 John Ousterhout 的一些演讲和访谈以及我自己的理解。

1. It's worth designing things twice.
   > 举得一个例子是，他在顶尖的大学里当教授，那里的学生都太优秀了。很多时候，他们的第一个想法就已经很好的，足够拿到分数。所以**他们从未有过认真思考的动力**。所以他的课上会去否定他们第一个想法，实践证明，他们想出来的第二个 idea 通常会更好。this is an area where smart spark people sometimes have to get past their history，**和聪明人一起共事，是可以突破的**。
   > 工作中也是，当我们开始解决非常非常困难的问题时候，没有人一开始的想法就是好的想法。不要太依赖第一时间想出来的那个 idea。多和同事沟通，理越辩越明。
   >
   > 任何时候都要随时准备重新设计。
2. These tools will make it easier to churn out low-level code as you call it autocomplete. Autocomplete will get better and better. Could actually be reasonably high quality code that gets turned out. The big question is to what degree can the AI tools actually replace **the higher level design tasks**？ I don't know the answer to that.
   > 这是老头子访谈中的原话，很有道理。没事儿的时候我也得多品品
   >
   > 未来软件开发要花费更多的时间在设计上，然后使用 AI 来生成代码。
3. **10x programmers** are those who come up with the really clean designs that can be implemented in very small amounts of code.
   > 有些人看着效率很高，但是设计出来的东西把其他所有人的效率都降低了。这点我是深有体会的。在工作的时候不能只盯着自己的功能，也要关注别人的设计。用钱学森钱老的话就是“不求单项设计的先进性，只求总体设计的合理性”。一般我们开发一个 feature 的时间有限，要更多地关注设计的合理。想想你在工作中遇到过这样的情况没有？实现使用的技术很酷炫、很风骚，但是设计很差。
   >
   > 在很多公司，这样的人被称为英雄。一个feature明天就能上线。。。这个不是10x programmer
4. 设计接口（一切其他东西）的时候，需要学会 change mindset
   > superclaude 提供的 role 其实是一个很好用的工具。不只是要从自己实现者的角度去考虑，还要考虑使用者。比如 caller 的 complexity. 【ROLE of Empathy】
5. The hardest part in software engineering, computers and programming is **the people**. 除了 caching 和 naming 之外，就是人了，懂得都懂。
   - miscommunication: misunderstood each other
   - the spec was off
   - we did not expect this to happen
   - we didn't have the empathy for the user
   - conflicts with the teammate
   - all human things.
6. all learning is about making mistakes. see why there are mistakes and then fix them. 从错误中学习。人教人，教不会。事教人，一教就会。实践出真知。
7. Education is basically creating a safe place where people can make mistakes and learn from them. Because I think a lot of developers out there are kind of sensitive. 这点太重要了。
   1. Maybe they they worry that if somebody criticizes their code, maybe that means they weren't such a good coder.
   2. Maybe they hink if i have to come up with a second idea, maybe i'm not that smart.
   3. 承认犯错的可能性是至关重要的，这个观念本身意义重大。
      > **很多程序员都太 sensitive 了，或许他们担心有人批评他们的代码，可能就意味着他们不是那么优秀了。** 这点太真实了。
8. John is not a fan of TDD, because he think it works against design. 但并没有否定测试的重要性。
   > TDD 的问题在于，没有任何环节鼓励你退后一步，思考整体任务和大局。会导致陷入极其短视的设计。**在编写代码之前写测试究竟有什么好处呢？**，实现完了再去写也没有任何影响。而且实现过程也不会被打断。所以，TDD 不利于设计。
   >
   > 唯一适合先写测试的场景就是 fix bug。作者一般是这样做的， 1. write the fix。 2. write the tests。3. back out the fix and make sure the tests fails.
9. comments 要多写，很多情况只是代码无法说明清楚。但是不要 repeat the code.
10. Working Code Isn’t Enough
    - **Strategic** Programming: invest time to produce clean designs and fix problems
    - **Tactical** Programming: getting features working as quickly as possible（大部分人都是这个样子的，get things done, 容易短视）
11. Pull Complexity Downwards
    > Most modules have more users than developers, so it is better for the developers to suffer than the users. As a module developer, you should strive to make life as easy as possible for the users of your module, even if that means extra work for you
    >
    > It is more important for a module to have a simple interface than a simple implementation. Excerpt From: John Ousterhout
12. Better Together Or Better Apart?
    > 两个功能，应该放在一起还是分开呢？
    >
    > 牢记，最后的目标是**reduce the complexity of the system as a whole and improve its modularity**.
    >
    > 如何切分微服务？如果紧密相连，还是不要切分的好，DDD
13. 白板是个好工具，**站在白板前，把所有的支持论点和反对论点都列出来。** 每一个观点都可以列在上面。然后让大家投票。不管之前讨论的多么激烈，最后大家总能达成非常非常强烈的共识。
14. 大学里学不到编程，因为老师缺少大量的编码练习。LOL
    > 老师没有这方面的经验。成为一个great developer需要大量的个人经验，练习。需要解决实际的问题。

## Summary

原书中提供了一些 Summary，我放到最后了。可惜是第一版的。

### Summary of Design Principles

- Complexity is incremental: you have to sweat the small stuff (see p. 11).
- Working code isn’t enough (see p. 14).
- Make continual small investments to improve system design (see p. 15).
- Modules should be deep (see p. 22)
- Interfaces should be designed to make the most common usage as simple as possible (see p. 27).
- It’s more important for a module to have a simple interface than a simple implementation (see pp. 55, 71).
- General-purpose modules are deeper (see p. 39).
- Separate general-purpose and special-purpose code (see p. 62).
- Different layers should have different abstractions (see p. 45).
- Pull complexity downward (see p. 55).
- Define errors (and special cases) out of existence (see p. 79).
- Design it twice (see p. 91).
- Comments should describe things that are not obvious from the code (see p. 101).
- Software should be designed for ease of reading, not ease of writing (see p. 149).
- The increments of software development should be abstractions, not features (see p. 154).

### Summary of Red Flags

- Shallow Module: the interface for a class or method isn’t much simpler than its implementation (see pp. 25, 110).
- Information Leakage: a design decision is reflected in multiple modules (see p. 31).
- Temporal Decomposition: the code structure is based on the order in which operations are executed, not on information hiding (see p. 32).
- Overexposure: An API forces callers to be aware of rarely used features in order to use commonly used features (see p. 36).
- Pass-Through Method: a method does almost nothing except pass its arguments to another method with a similar signature (see p. 46).
- Repetition: a nontrivial piece of code is repeated over and over (see p. 62).
- Special-General Mixture: special-purpose code is not cleanly separated from general purpose code (see p. 65).
- Conjoined Methods: two methods have so many dependencies that its hard to understand the implementation of one without understanding the implementation of the other (see p. 72).
- Comment Repeats Code: all of the information in a comment is immediately obvious from the code next to the comment (see p. 104).
- Implementation Documentation Contaminates Interface: an interface comment describes implementation details not needed by users of the thing being documented
- Vague Name: the name of a variable or method is so imprecise that it doesn’t convey much useful information (see p. 123).
- Hard to Pick Name: it is difficult to come up with a precise and intuitive name for an entity (see p. 125).
- Hard to Describe: in order to be complete, the documentation for a variable or method must be long. (see p. 131).
- Nonobvious Code: the behavior or meaning of a piece of code cannot be understood easily. (see p. 148).
