---
title: MongoDB-Charts可视化图表分析工具安装使用
date: 2020-01-06 14:05:37
tags:
category:
- MongoDB
---

[MongoDB-Charts](https://www.mongodb.com/products/charts)是创建MongoDB数据可视化的最佳方法。作为数据源连接到任何MongoDB实例，创建图表和图形，将它们嵌入到您的应用程序中，或构建实时仪表板以进行共享和协作。

<!--more-->

[官方介绍文档](https://docs.mongodb.com/charts/master/)

[官方安装文档](https://docs.mongodb.com/charts/onprem/installation/)

![](http://images.mokeee.com/sample-dashboard.png)

![](http://images.mokeee.com/ArrayReductionChart-wnwfii0xsk.gif)
# 安装

## 系统要求

- MongoDB： >= 3.6
- Docker： Docker CE或EE>=v17.06

## 创建目录

```
    mkdir mongodb-chartscd mongodb-charts
```
## 下载Docker Compose
[https://www.mongodb.com/download-center/charts](https://www.mongodb.com/download-center/charts)
## 启用Docker Swarm模式
```
    docker swarm init
```
## 拉取镜像
```
    docker pull quay.io/mongodb/charts:19.12.1
```
> 版本号根据实际情况而定
> 下载可能需要一段时间。

## 测试连接
```
    docker run --rm quay.io/mongodb/charts:v0.10.0 charts-cli test-connection mongodb://<username>:<password>@yourhost/
```
> 注意：如果你需要连接本地的MongDB作为数据源，在填写host时不能使用`localhost`

- 对于Docker 18.03及更高版本：
- 对于Windows和macOS，请使用mongodb://host.docker.internal。
- 对于Linux，请使用docker0接口的IP地址。通常，此地址为172.17.0.1。
- 对于Docker版本17.06至不包括18.03：
- 对于Windows，请使用mongodb://docker.for.win.localhost。
- 对于macOS，请使用mongodb://docker.for.mac.localhost。
- 对于Linux，请使用docker0接口的IP地址。通常，此地址为172.17.0.1。

如果连接成功，将会显示：
```
    MongoDB connection URI successfully verified.
```
## 创建docker secret
格式如下
```
    echo"<Verified connection string URI from step 5>" | docker secret create charts-mongodb-uri -`
```
例如：
```
    echo"mongodb://admin:password@localhost:27017/" | docker secret create charts-mongodb-uri -
```
# 配置

## 启动
```
    docker stack deploy -c charts-docker-compose-v19.12.1.yml mongodb-charts
```
## 验证容器是否在运行
```
    docker service ls
```
|    ID   |          NAME   |                 MODE     |    |REPLICAS   IMAGE       |            PORTS |
|----|----|----|----|----|----|
| j77uo3slyg4l |   mongodb-charts_charts |  replicated  | 1/1       | mongodb-charts:latest |  *:80->80/tcp |

## 创建用户

以Mac为例，将下面的替换为自己的：
```
    docker exec -it \  $(docker container ls --filter name=_charts -q) \  charts-cli add-user --first-name "<First>" --last-name "<Last>" \  --email "<user@example.com>" --password "<Password>" \  --role "<UserAdmin|User>"
```
## 启动和停止MongoDB图表

启动：
```
    docker stack deploy -c charts-docker-compose-v19.12.1.yml mongodb-charts
```
停止：
```
    docker stack rm mongodb-charts
```
# 使用

## 登录

输入`localhost:8180`进入MongoDB-Charts的WEB页面
使用刚才设置的用户名密码登录

## 添加数据源

## 添加图表

## 按需生成图表
