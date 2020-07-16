---
title: Redis持久化 - 笔记
date: 2019-10-06 17:53:54
tags:
Category:
- Redis
---

正如我们知道的，Redis的数据全部存储在内存中，如果宕机就会导致数据丢失，所以需要一种机制来保障数据不丢失或只丢失很少一部分。

<!--more-->

Redis目前支持两种持久化方式，`RDB` 和 `AOF`。

## RDB
### 简介
RDB 持久化方式会保存Redis在特定时间节点的数据，生成RDB快照文件。

### 工作原理
- fork 子进程
- 子进程将数据写到临时文件
- 用临时文件替换旧RDB文件

**手动触发：**  
- `save`：会阻塞当前Redis服务器，直到持久化完成，线上应该禁止使用。
- `bgsave`：该触发方式会fork一个子进程，由子进程负责持久化过程，因此阻塞只会发生在fork子进程的时候。

**自动触发：**  
- 根据我们的 `save m n` 配置规则自动触发；
- 从节点全量复制时，主节点发送rdb文件给从节点完成复制操作，主节点会触发 `bgsav`e；
- 执行 `debug reload` 时；
- 执行  `shutdown` 时，如果没有开启aof，也会触发。

### 优点
- RDB是一个简洁的、压缩过的二进制文件，保存了Redis在某个时间点的数据，很适合做冷备，可以很方便的恢复到不同版本。
- 数据恢复时，RDB比AOF速度更快

### 缺点
- RDB按时间节点保存文件，可能导致数据丢失过多。
- RDB通过fork子进程产生持久化文件，如果数据量太大，会造成阻塞。

### 命令
`save`  
同步、阻塞

`bgsave`
异步非阻塞，主进程会fork一个子进程来完成 bgsave 生成RDB文件，但在fork子进程的过程中，主进程会阻塞，无法响应客户端的请求。

配置

```
# 时间策略
save 900 1
save 300 10
save 60 10000

# 文件名称
dbfilename dump.rdb

# 文件保存路径
dir /home/work/app/redis/data/

# 如果持久化出错，主进程是否停止写入
stop-writes-on-bgsave-error yes

# 是否压缩
rdbcompression yes

# 导入时是否检查
rdbchecksum yes

```

## AOF （append only file）

### 简介
AOF 持久化方式会记录Redis的所有命令请求，以追加的方式写到指定文件里。

### 工作原理
- 命令写入
- 追加到aof_buf
- 同步到aof磁盘

### 优点
- AOF 比 RDB更可靠，最多丢失1秒钟的数据
- AOF 文件如遇断电，可以通过 `redis-check-aof -fix filename` 来进行修复
- AOF 文件体积如果太大，可以进行重写然后替换旧文件。（重写时旧文件仍客追加命令，数据是从redis读取的，不会对旧文件进行操作）
- AOF文件是可读的，是以Redis命令协议追加到文件的。


### 缺点
- 相同的数据，AOF比RDB体积更大
- 恢复数据时AOF比RDB更慢


### 命令

重写  `BGREWRITEAOF`

配置
```
# 是否开启aof
appendonly yes

# 文件名称
appendfilename "appendonly.aof"

# 同步方式
appendfsync everysec

# aof重写期间是否同步
no-appendfsync-on-rewrite no

# 重写触发配置
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 加载aof时如果有错如何处理
aof-load-truncated yes

# 文件重写策略
aof-rewrite-incremental-fsync yes
```

## AOF 重写
工作原理
- fork子进程
- 子进程把新的AOF文件写到临时文件
- 主进程将此期间的命令写到 复制缓冲区和旧的AOF文件里
- 子进程重写完成后，再将缓冲区里的命令追加到AOF文件中
- 替换旧的AOF文件

> Redis 2.4之后的版本才可以自动进行日志重写，之前的版本需要手动运行BGREWRITEAOF这个命令。

`appendfsync everysec` 它其实有三种模式:
- `always`：把每个写命令都立即同步到aof，很慢，但是很安全
- `everysec`：每秒同步一次，是折中方案
- `no`：redis不处理交给OS来处理，非常快，但是也最不安全

注意点：
- 在重写期间，由于主进程依然在响应命令，为了保证最终备份的完整性；因此它依然会写入旧的AOF file中，如果重写失败，能够保证数据不丢失。
- 为了把重写期间响应的写入信息也写入到新的文件中，因此也会为子进程保留一个buf，防止新写的file丢失数据。
- 重写是直接把当前内存的数据生成对应命令，并不需要读取老的AOF文件进行分析、命令合并。
- AOF文件直接采用的文本协议，主要是兼容性好、追加方便、可读性高可认为修改修复。

## 数据恢复
重启Redis时，优先加载AOF文件，如果不存在则加载RDB文件

## 性能与实践

通过上面的分析，我们都知道RDB的快照、AOF的重写都需要fork，这是一个重量级操作，会对Redis造成阻塞。因此为了不影响Redis主进程响应，我们需要尽可能降低阻塞。

1. 降低fork的频率，比如可以手动来触发RDB生成快照、与AOF重写；
2. 控制Redis最大使用内存，防止fork耗时过长；
3. 使用更牛逼的硬件；
4. 合理配置Linux的内存分配策略，避免因为物理内存不足导致fork失败。

在线上我们到底该怎么做：

1. 如果Redis中的数据并不是特别敏感或者可以通过其它方式重写生成数据，可以关闭持久化，如果丢失数据可以通过其它途径补回；
2. 自己制定策略定期检查Redis的情况，然后可以手动触发备份、重写数据；
3. 单机如果部署多个实例，要防止多个机器同时运行持久化、重写操作，防止出现内存、CPU、IO资源竞争，让持久化变为串行；
4. 可以加入主从机器，利用一台从机器进行备份处理，其它机器正常响应客户端的命令；
5. RDB持久化与AOF持久化可以同时存在，配合使用。

> 文章内容收集自网络
