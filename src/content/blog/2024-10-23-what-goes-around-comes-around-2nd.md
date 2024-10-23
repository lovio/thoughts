---
author: Qi Liu
pubDatetime: 2024-10-23
title: "What Goes Around Comes Around... And Around..."
featured: true
tags:
  - Paper
  - database
description: |
  This is a paper published 20 years after the debut of《What Goes Around Comes Around》
  and summarized the evolution of database systems over the past two decades.
---

## Table of contents

## Introduction

大概是五年前，我开始学习数据库的底层知识。有一本很好的入门教材，叫作[Readings in Database Systems](https://www.redbook.io/)
简称小红书。里面开篇就是推荐了《What Goes Around Comes Around》这篇论文。在这篇论文里介绍了当时的数据库的发展情况。然后我今天想要分享的是20年后的更新之作
《What Goes Around Comes Around... And Around...》，这是 Michael Stonebraker 和 Andy Pavlo 合作完成的，而且 Stonebraker 就是前作的作者之一。
这篇论文非常好的总结了过去二十年数据库领域的变化和趋势，非常值得一读。

## TL;DR

这篇 Paper 里细节很多，我印象比较深刻的是：

- SQL 和 RM 依然是主流，很多 NoSQL 也逐渐开始了 SQL-like interface 的支持。尽管有过有各种替换 **SQL** 和 **RM** 的尝试，但是大都失败了。大多数没有采用 SQL 或者 RM 的数据库有在特定的市场活跃。
  > SQL是世界上做好的语言？ LOL
- LakeHouse 是趋势
- OLAP 几乎都使用 columnar systems
- Cloud Database 的未来是基于 NAS（S3），计算与存储分离、无服务化
  > Amazon S3 is designed for 99.999999999% (11 9's) of durability, and stores data for millions of customers all around the world.
  >
  > S3 的 11 个 9 的持久性意味这什么？
  >
  > - 人为犯错的可能性更高。
  > - 其实完全没有必要为 S3 的数据再去做一个备份。
  > - 不行就开启 CRR (Cross-Region Replication) 吧!

## Notes

### Data Models & Query Languages

#### MapReduce System

> 性能太差，然后死掉了。

- Google 在 2003 年推出了 MapReduce framework
- Yahoo! 在 2006 年开发了开源的 MR，叫作 **Hadoop**. Hadoop 跑在 HDFS（Google File System 的克隆） 之上
- 2009 年，**Data Warehouse DBMSs** outperformed Hadoop
  > Google and the DBMS community 互发文章对决
  >
  > 1. Google argued that with careful engineering, a MR system will beat DBMSs, and a user does not have to load data with a schema before running queries on it. Thus, MR is better for “one shot” tasks, such as text processing and ETL operations.
  > 2. The DBMS community argued that **MR incurs performance problems due to its design** that existing parallel DBMSs already solved. Furthermore, **the use of higher-level languages (SQL) operating over partitioned tables** has proven to be a good programming model
- 2010s. Hadoop technology and services market cratered (Hadoop 死了)

  - Many enterprises spent a lot of money on Hadoop clusters, only to ﬁnd there was little interest in this functionality.
  - Developers found it difficult to shoehorn their application into the restricted MR/Hadoop paradigm.

    > 导致 Cloudera, Hortonworks, MapR 没有产品可卖了。
    >
    > - Cloudera rebranded Hadoop to mean the whole stack (application, Hadoop, HDFS). In a further sleight-of-hand, Cloudera built a RDBMS, **Impala [150], on top of HDFS but not using Hadoop.**
    > - In a similar vein, MapR built **Drill** [22] directly on HDFS, and Meta created **Presto** [185] to replace Hive.

- Hadoop + SQL + RM -> Meta's **Hive**
- Google announced that they were moving their crawl processing from **MR** to **BigTable**
  - The reason was that Google needed to interactively update its crawl database in real time but **MR was a batch system**.
  - Google ﬁnally announced in 2014 that MR had no place in their technology stack and killed it off

##### MR's Legacy

- MR also brought about the revival of **shared-disk architectures** with disaggregated storage, subsequently giving rise to **open-source ﬁle formats and data lakes**
- Hadoop’s limitations opened the door for other data processing platforms, namely **Spark** and **Flink**

#### Key/Value Stores

> 关系数据库可以轻易地模拟 KV 数据库
>
> 如果需要 embedded DBMS，可以使用 SQLite 和 [DuckDB](Tech/distributed%20system%20&%20database/DuckDB/DuckDB.md)
>
> 新架构上有一个趋势是使用 embedded KV stores 来作为 full-featured DBMSs 的底层 storage manager，比如 Meta 给 MySQL 替换了一个基于 RocksDB 的 MyRocks 引擎，MongoDB 使用 WiredTiger's KV Store 替代 MMAP

The key/value (KV) data model is the simplest model possible. It represents the following binary relation:

```
(key,value)
```

- Memcached and **Redis**
- **DynamoDB**(2007) like systems offer **higher and more predictable performance**, compared to a RDBMS, in exchange for more limited functionality
- Google's **LevelDB** and Meta's later forked **RocksDB** are embedded storage managers designed to run in the same address space as a higher-level application

#### Document Databases

The document data model represents a database as **a collection of record objects.**

在 2000s 的时候，关系数据库的 scalability 很差。NoSQL 提供了很好的 scalability，然后就火了，比如 **MongoDB**。当时有两个 marketing messages

- SQL and joins are slow, and one should use a “faster” lower-level, record-at-time interface
- ACID transactions are unnecessary for modern applications, so the DBMS should only provide weaker notion of it

> 讽刺的是，at the end of 2010s, almost every NoSQL DBMS added a SQL interface.
>
> - DynamoDB PartiQL
> - Cassandra CQL
> - Aerospike AQL
> - Couchbase SQL++
> - Mongo added SQL for their Atlas service in 2021
>
> 有些也添加了 `strongly consistent (ACID) transactions`
>
> `SQL:2016` 开始添加JSON的支持，`SQL:2023`添加了 JSON 的类型，主要的难度在于 SQL optimizers，尤其是早期的，slow and ineffective

##### My Thoughts on MongoDB

我在2014-2016年创业的时候就重度使用 MongoDB，一开始的时候还没有 WiredTiger,性能非常差。但是对于小型业务来说非常好，他有着很好的 scalability 和 flexibility。
对于 Node.js 来说又是非常的好用，直接把 JSON 存起来实在是太方便了，aggregation pipeline 也很好用。Replication 和 Sharding 也很好用。

前段时间我又重新去看一眼 MongoDB，发现功能上并没有什么大的变化。当然性能上应该提升了很多，毕竟一个数据库其实大部分的工作就是提升性能、可靠性，功能性其实挺谨慎的。
让我震惊的是 MongoDB 和 Redis 都支持了 vector search。有点担心 vector database 厂商的前景了。

#### Column-Family Databases aka wide-column

- it is a reduction of the **document data model** that **only supports one level of nesting instead of arbitrary nesting;**
- 2004, google‘s BigTable, 后来重写了Spanner 来代替 BigTable [Spanner Google’s Globally-Distributed Database](Tech/distributed%20system%20&%20database/Datatabase/Spanner%20Google’s%20Globally-Distributed%20Database.md)
- **Cassandra**, Thrift-API -> CQL
- **HBase**, the Phoenix SQL-frontend

#### Text Search Engines

By tokenizing documents into a “bag of words” and then building full-text indexes (aka inverted indexes) on those tokens to support queries on their contents.

- Elasticsearch and Solr both use Lucene as their internal serch library
- Text data is inherently unstructured, which means that there is no data model.
- Inverted index-centric search engines based on SMART are used for exact match searches. These methods have been supplanted in recent years by **similarity search using ML-generated embeddings**

#### Array Databases

常见的 array data representation usage:

- vectors (one dimension)
- matrices (two dimensions)
- tensors (three or more dimensions)

- 比如地理区域的科学调查经常使用
  `(latitude, longitude, time, [vector-of-values])`
- Arrays are also the core of most ML data sets.

##### System Challenges with storing and querying real-world array data sets

- array data does not always align to a regular integer grid 常数网格
  > geospatial data is often split into irregular shapes.

##### Discussion

- HDF5 is popular for satellite imagery and other gridded scientiﬁc data.
- Array Databases 不是一个有规模的市场
- The SQL:2023 standard includes support for true multi-dimensional arrays (SQL/MDA) that is heavily inspired by Rasdaman’s RQL

#### Vector Databases

Similar to how the column-family model is a reduction of the document model, the vector data model simplifies the array data model to **one-dimensional rasters.**

> developers use them to store single-dimension embeddings generated from AI tools. 导致了 vector databases 的流行
>
> 听过一个 LanceDB 创始人的分享，他们一开始并不知道自己的数据库有什么用，还是 AI 厂商找到了他们，说他们的数据库可以用来存储 embedding。

For example, one could **convert each Wikipedia article into an embedding** using Google BERT and store them in a vector database along with additional article meta-data:
`(title, date, author, [embedding-vector])`
sizes:

- from 100s dimensions for simple transformers
- to 1000s for high-end models

One compelling feature of vector DBMSs is that they provide better integration with AI tools (e.g., ChatGPT, LangChain) than RDBMSs.

> vector DBMSs are essentially document-oriented DBMSs with **specialized ANN indexes.**

In 2023, many of the major RDBMSs added vector indexes, including Oracle, SingleStore, Rockset, and Clickhouse. Contrast this with JSON support in RDBMSs. NoSQL systems like MongoDB and CouchDB became popular in the late 2000s and it took several years for RDBMSs to add support for it

现有数据库引入 vector index 也不困难，有很多开源的库

- pgVector
- DiskANN
- FAISS
- ...

#### Graph Databases

有两种流行的表达：

- the resource description framework (RDF)
  - RDF databases (aka triplestores) only model a directed graph with labeled edges.
  - for OLTP workloads
  - Neo4j
- property graphs
  - With property graphs, the DBMS maintains a directed multi-graph structure that supports key/value labels for nodes and edges.
  - for analytics, which seeks to derive information from the graph. An example of this scenario is ﬁnding which user has the most friends under 30 years old.
  - Tigergraph, JanusGraph, Giraph, Turi...

##### Key Challenge

these systems have to overcome is that it is possible to simulate a graph as a collection of tables:

```
Node (node_id, node_data)
Edge (node_id_1, node_id_2, edge_data)
```

This means that RDBMSs are always an option to support graphs.
但是 vanilla SQL is not expressive enough for graph queries and thus **require multiple client-server roundtrips for traversal operations.**

> 在石墨文档，基本也是这么搞的。也是这个导致我对数据库产生了兴趣

- SQL:2023 introduced property graph queries (SQL/PGQ) for deﬁning and traversing graphs in a RDBMS
- More recent work showed how SQL/PGQ in [DuckDB](Tech/distributed%20system%20&%20database/DuckDB/DuckDB.md) outperforms a leading graph DBMS by up to 10x
  > 关系数据库在处理图查询上非常快。所以图数据库的优势何在？

#### Summary

A reasonable conclusion from the above section is that non-SQL, non-relational systems are either a niche market or are fast becoming SQL/RM systems.

> 要么有自己的合适的市场，要么成为 SQL/RM

- MapReduce Systems: They died years ago and are, at best, a legacy technology at present.
- Key-value Stores: Many have either matured into RM systems or are only used for speciﬁc problems. **These can generally be equaled or beaten by modern high-performance RDBMSs.** relational database 化
- Document Databases: Such NoSQL systems are on a collision course with RDBMSs. The differences between the two kinds of systems have diminished over time and should become nearly indistinguishable in the future. 估计会被 RDBMs 干掉
- Column-Family Systems: These remain a niche market. Without Google, this paper would not be talking about this category.
- Text Search Engines: RDBMS 在这方面还没有很好的办法
- Vector Databases: They are single-purpose DBMSs with indexes to **accelerate nearest-neighbor search.** 单一用途， RM 可以替代。
- Graph Databases: 很小的市场
  - **OLTP graph applications will be largely served by RDBMSs.**
  - In addition, analytic graph applications have unique requirements that are best done in main memory with specialized data structures.

### System Architectures

#### Columnar Systems

Data warehouse applications have common properties that are distinct from OLTP workloads:

1. They are historical in nature (i.e., they are loaded periodically and then are read-only).
2. Organizations retain everything as long as they can afford the storage — think terabytes to petabytes.
3. Queries typically only access a small subset of attributes from tables and are ad-hoc in nature.

##### Organizing the DBMS’s storage by columns instead of rows has several beneﬁts

- **compressing columnar data is more effective** than row-based data because there is a single value type in a data block often many repeated bytes.
- a Volcano-style engine executes operators once per row. In contrast, **a column-oriented engine has an inner loop that processes a whole column using vectorized instructions**
- row stores have a large header for each record (e.g., 20 bytes) to **track nulls and versioning meta-data**, whereas column stores have minimal storage overhead per record.
  因为在过去的 20 年，所有的 data warehouse 都使用 a column store

In summary, column stores are new DBMS implementations with specialized _optimizers_, _executors_, and _storage formats_. They have taken over the data warehouse marketplace because of their superior performance.

#### Data Lakes / Lakehouse

这是一个趋势，从单体、专门的 OLAP data warehouses for OLAP workloads 转向 data lakes backed by object stores.

##### Original Data Warehouse

ingesting -> stored with proprietary formats

Vendors viewed their DBMSs as the “**gatekeepers**” for all things related to data in an organization.

但是在过去，很多组织特别是科技公司都不这样搞

##### Data lake architecture

1. applications upload ﬁles to a distributed object store, **bypassing the traditional route through the DBMS**
   - applications write data to data lakes using open-source, disk-resident ﬁle formats. The two most popular formats are Twitter/Cloudera’s **Parquet** and Meta’s **ORC**
   - Apache Arrow is a similar binary format for exchanging in-memory data between systems.
2. Users then **execute queries and processing pipelines on these accumulated ﬁles using a lakehouse** (a portmanteau of data warehouse and data lake) **execution engine**
   - These lakehouse systems provide **a uniﬁed infrastructure supporting SQL and non-SQL workloads.**
     - non-SQL 是至关重要的，很多数据科学家和 ML practitioner 经常使用 Python-based notebooks that use Panda's DataFrame API to access data instead of SQL

##### DataLakes真香？

a data lake seems like a terrible idea for an organization:

- allowing any application to write arbitrary ﬁles into a centralized repository without any governance is a recipe for _integrity_, _discovery_, and _versioning_ **problems**
- Lakehouses provide - muchneeded control over these environments to help mitigate many problems with meta-data, caching, and indexing services. - Additional middleware that tracks new data and supports transactional updates, such as Delta Lake, Apache Iceberg, and Hudi, make lakehouses look more like a traditional data warehouse.
  > 更像一个传统的 data warehouse
- query optimization 也是一个挑战。
  - DBMSs have always struggled with acquiring precise statistics on data, leading to poor query plan choices. However, **a data lake system may completely lack statistics on newly ingested data ﬁles.**
  - **incorporating adaptive query processing strategies** is imperative in the cloud to enable a DBMS to dynamically modify query plans during execution based on observed data characteristics

但是几乎所有的主流的 cloud vendors 提供了 some variation of a managed data lake service. why?

- data lake systems backed by object stores are much **cheaper** per gigabyte than proprietary data warehouses

#### NewSQL Systems

many organizations could not use these NoSQL systems because **their applications could not give up strong transactional requirements.**
But the existing RDBMSs were not able to scale across multiple machines
所以，NewSQL 出现了。

- the scalability of NoSQL systems for OLTP workloads
- still supporting SQL

##### two main groups of NewSQL systems

- in-memory DBMSs
  - H-Store, commercialized as VoltDB
  - SingleStore
  - Microsoft Hekaton
  - Hyper
- disk-oriented, distributed DBMSs
  - NuoDB
  - Clusrix

> 但是切换 NewSQL 也不是很如意，毕竟大家在切换 OLTP DBMSs 时更加谨慎。

##### Aftermath of NewSQL

distributed, transactional SQL RDBMSs

- TiDB
- CockroachDB
- PlanetScale (based on the Vitess sharding middleware)
- YugabyteDB
- ...

主流的 NoSQL 也在添加事务。。。
MongoDB, Cassandra, and DynamoDB，甚至 Google Spanner

> Google said this cogently when they **discarded eventual consistency in favor of real transactions with Spanner** in 2012

#### Hardware Accelerators

- FPGAs
- GPUs

to accelerate queries

OLAP workloads will continue to move aggressively to the cloud, but special purpose hardware is not likely to ﬁnd acceptance unless it is built by the cloud vendor.

The only place that custom hardware accelerators will succeed is for the large cloud vendors.

> Amazon did this already with their Redshift AQUA accelerators. Google BigQuery has custom components for in-memory shufﬂes.

#### Blockchain Databases

The ideal use case for blockchain databases is peer-to-peer applications where one cannot trust anybody.

At the present time, cryptocurrencies (Bitcoin) are the only use case for blockchains

> 够讽刺的了

Legitimate businesses are unwilling to pay the performance price (about ﬁve orders of magnitude) to use a blockchain DBMS

To the best of our knowledge, all the major cryptocurrency exchanges run their businesses off traditional RDBMSs and not blockchain systems.

> 最关键的是什么？
>
> No sensible company would rely on random participants on the Internet as the backup solution for mission-critical databases.

#### Summary

- Columnar Systems: The change to columnar storage revolutionized OLAP DBMS architectures.
- Cloud Databases:
- Data Lakes / Lakehouses: Cloud-based object storage using open-source formats will be the OLAP DBMS archetype for the next ten years.
- NewSQL Systems: They leverage new ideas but have yet to have the same impact as columnar and cloud DBMSs.
- Hardware Accelerators: We **do not see a use case** for specialized hardware outside of the major cloud vendors, though start-ups will continue to try.
- Blockchain Databases: An **inefﬁcient** technology looking for an application. History has shown this is the wrong way to approach systems development.

### Parting Comments

- Never underestimate the value of good marketing for bad products. 劣币驱逐良币
  - Oracle did this in the 1980s
  - MySQL did this in the 2000s
  - MongoDB did this in the 2010s
- Beware of DBMSs from large non-DBMS vendors. 绩效？
  - Meta (Hive, Presto, Cassandra, RocksDB)
    > RocksDB is eating the world
  - Linkin (Kafka, Pinot, Voldemort)
    > Kafka is eating the world
  - 10gen (MongoDB)
  - PowerSet(HBase)
    > The company then releases the DBMS as an open-source project (often pushed to the Apache Foundation for stewardship) in hopes to achieve “free” development from external users.
- Do not ignore the out-of-box experience.
  - Most SQL systems require one **ﬁrst to create a database** and **then deﬁne their tables** before they can load data.
  - Every DBMS should, therefore, make it easy to perform in situ processing of local and cloudstorage ﬁles. DuckDB's rising popularity is partly due to its ability to do this well.
- Developers need to query their database directly.
  - an endpoint API
  - ORM
  - SQL
- The impact of **AI/ML** on DBMSs will be significant.
  - natural languages to query database

### Conclusion

One of us will likely still be alive and out on bail in two decades, and thus fully expects to write a follow-up to this paper in 2044.

> LOL
