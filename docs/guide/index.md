# 系统设计主题：从这里开始

## 目的

> 学习如何设计大型系统。
>
> 为系统设计的面试做准备。

### 学习如何设计大型系统

学习如何设计可扩展的系统将会有助于你成为一个更好的工程师。

系统设计是一个很宽泛的话题。在互联网上，**关于系统设计原则的资源也是多如牛毛。**

这个仓库就是这些资源的**组织收集**，它可以帮助你学习如何构建可扩展的系统。

### 从开源社区学习

这是一个不断更新的开源项目的初期的版本。

欢迎[贡献](https://github.com/donnemartin/system-design-primer/blob/master/CONTRIBUTING.md)！

### 为系统设计的面试做准备

在很多科技公司中，除了代码面试，系统设计也是**技术面试过程**中的一个**必要环节**。

**实践常见的系统设计面试题**并且把你的答案和**例子的解答**进行**对照**：讨论，代码和图表。

面试准备的其他主题：

* [学习指引](/guide/study-guide)
* [如何处理一个系统设计的面试题](/guide/interview-approach)
* [系统设计的面试题，**含解答**](/interview/index)
* [面向对象设计的面试题，**含解答**](/ood/index)
* [其它的系统设计面试题](/topics/appendix#其它的系统设计面试题)

不熟悉系统设计？

首先，你需要对一般性原则有一个基本的认识，知道它们是什么，怎样使用以及利弊。

## 第一步：回顾可扩展性（scalability）的视频讲座

[哈佛大学可扩展性讲座](https://www.youtube.com/watch?v=-W9F__D3oY4)

* 主题涵盖
    * 垂直扩展（Vertical scaling）
    * 水平扩展（Horizontal scaling）
    * 缓存
    * 负载均衡
    * 数据库复制
    * 数据库分区

## 第二步：回顾可扩展性文章

[可扩展性](https://web.archive.org/web/20221030091841/http://www.lecloud.net/tagged/scalability/chrono)

* 主题涵盖：
    * [Clones](https://web.archive.org/web/20220530193911/https://www.lecloud.net/post/7295452622/scalability-for-dummies-part-1-clones)
    * [数据库](https://web.archive.org/web/20220602114024/https://www.lecloud.net/post/7994751381/scalability-for-dummies-part-2-database)
    * [缓存](https://web.archive.org/web/20230126233752/https://www.lecloud.net/post/9246290032/scalability-for-dummies-part-3-cache)
    * [异步](https://web.archive.org/web/20220926171507/https://www.lecloud.net/post/9699762917/scalability-for-dummies-part-4-asynchronism)

## 接下来的步骤

接下来，我们将看看高阶的权衡和取舍:

* **性能**与**可扩展性**
* **延迟**与**吞吐量**
* **可用性**与**一致性**

记住**每个方面都面临取舍和权衡**。

然后，我们将深入更具体的主题，如 DNS、CDN 和负载均衡器。
