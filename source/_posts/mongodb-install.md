---
title: MongoDB安装和简单实用
date: 2020-02-29 16:45:35
tags: 
- 数据库
category: 
- MongoDB
---

# 简介

- 基于分布式文件存储的数据库。由C++语言编写。
- 介于关系数据库和非关系数据库之间，是非关系数据库当中功能最丰富，最像关系数据库的。它支持的数据结构非常松散，是类似json的bson格式，因此可以存储比较复杂的数据类型。Mongo最大的特点是它支持的查询语言非常强大，其语法有点类似于面向对象的查询语言，几乎可以实现类似关系数据库单表查询的绝大部分功能，而且还支持对数据建立索引。

<!--more-->

# 数据形式

MongoDB 存储的数据对象由键值对组成。MongoDB 所有存储在集合中的数据都是 BSON 格式。BSON 是一种类似 JSON 的二进制形式的存储格式，是 Binary JSON 的简称。

形式如下：
```
    {
    	"_id": ObjectId("5c89f787ca6e4e3ac1ecabkk"),
    	"update_time": ISODate("2019-06-03T15:00:42.142Z"),
    	"create_time": ISODate("2019-03-14T14:41:11.217Z"),
    	"creator": "test_user",
    	"admin": ["admin1", "admin2"],
    	"ops": ["ops1"],
    	"labels": {
    		"department": "departmentA",
    		"main_class": "mainClassA"
    	}
    }
```
# 概念解析
| SQL术语/概念 | MongoDB术语/概念 | 解释说明 |
| ---- | ---- | ---- |
| database | database | 数据库 | 
| table | collection| 数据库表/集合 |
| row | document | 数据记录行/文档 |
| column | field | 数据字段/域 | 
| index | index | 索引 |
| primary key | primary key | 主键,MongoDB自动将_id字段设置为主键 |

## 在MySql 中
| id | name | birthday | sex | 
| ---- | ---- | ---- | ---- |
| 1 | 张豆豆 | 19960601 | 男 |
| 2 | 杨花花 | 19950726 | 女 |

## 在mongoDBzhong 中
```
    {
        "_id": ObjectId("5c89f787ca6e4e3ac1ehhb23"),
        "name": "张豆豆",
        "birthday": "19960601",
        "sex": "男"
    }, {
        "_id": ObjectId("5c89f787ca6e4e3ac1ehhb24"),
        "name": "杨花花",
        "birthday": "19950726",
        "sex": "女"
    }
```

# 应用场景

## 适用的场景

- 无需要跨文档或跨表的事务及复杂的join查询支持 (目前已经支持事务，join的支持也越来越好)。
- 敏捷迭代的业务，需求变动频繁，数据模型无法确定
- 存储的数据格式灵活，不固定，或属于半结构化数据
- 业务并发访问量大，需数千的QPS(每秒查询率)
- TB级以上的海量数据存储，且数据量不断增加
- 要求存储的数据持久化、不丢失
- 需要99.999%的数据高可用性

场景举例：

- 游戏场景：使用 MongoDB 存储游戏用户信息，用户的装备、积分等直接以内嵌文档的形式存储，方便查询、更新
- 物流场景：使用 MongoDB 存储订单信息，订单状态在运送过程中会不断更新，以 MongoDB 内嵌数组的形式来存储，一次查询就能将订单所有的变更读取出来。
- 社交场景：使用 MongoDB 存储存储用户信息，以及用户发表的朋友圈信息，通过地理位置索引实现附近的人、地点等功能
- 物联网场景：使用 MongoDB 存储所有接入的智能设备信息，以及设备汇报的日志信息，并对这些信息进行多维度的分析
- 视频直播：使用 MongoDB 存储用户信息、礼物信息等
- ……

案例1

> 用在应用服务器的日志记录，查找起来比文本灵活，导出也很方便。也是给应用练手，从外围系统开始使用MongoDB。
> 用在一些第三方信息的获取或者抓取，因为MongoDB的schema-less，所有格式灵活，不用为了各种格式不一样的信息专门设计统一的格式，极大的减少开发的工作。

案例2

> mongodb之前有用过，主要用来存储一些监控数据，No schema 对开发人员来说，真的很方便，增加字段不用改表结构，而且学习成本极低。

案例3

> 使用MongoDB做了O2O快递应用，·将送快递骑手、快递商家的信息（包含位置信息）存储在 MongoDB，然后通过 MongoDB 的地理位置查询，这样很方便的实现了查找附近的商家、骑手等功能，使得快递骑手能就近接单，目前在使用MongoDB 上没遇到啥大的问题，官网的文档比较详细，很给力。

## 不适用的场景：

- 要求**高度事务性**的系统。
- 复杂的**跨表**级联查询。

---

# 安装
## Homebrew安装
```
    brew tap mongodb/brew
    brew install mongodb-community@4.2
```
环境变量：
打开 .bash_profile
```
    open -e .bash_profile
```
添加一行
```
    export PATH=/usr/local/Cellar/mongodb-community/4.2.1/bin:${PATH}}
```
然后
```
    source .bash_profile
```
开机自启：
```
    ln -sfv /usr/local/Cellar/mongodb-community/4.2.1/*.plist ~/Library/LaunchAgents
```
## 手动安装

1. 下载

下载地址： [https://www.mongodb.com/download-center/community?jmp=nav](https://www.mongodb.com/download-center/community?jmp=nav)

选择版本及对应的操作系统后进行下载
![](http://images.mokeee.com/blog/20191124165455.jpg)
1. 将下载完成的文件解压并重命名为mongodb
![](http://images.mokeee.com/blog/20191124163648.png)
2. 将文件夹移动到 `/usr/local` 目录下
![](http://images.mokeee.com/blog/20191124165909.png)
3. 配置环境变量
在命令行中输入
```
    open -e .bash_profile
```
在打开的文件中添加一行
```
    bash export PATH=${PATH}:/usr/local/mongodb/bin
```
4. 创建mongodb数据存储目录
```
    mkdir -p /data/db
```
---

## 启动

启动服务
```
    mongod
```
然后打开另一个命令行窗口，输入
```
    mongo
```
这样就可以操作mongodb了。

# 与PHP一起使用

> 在PHP中使用MongoDB，需要安装PHP-MongoDB驱动
> 我使用pecl安装
```
    pecl install mongodb
```
### 1. 直接使用
```php
    $manager = new MongoDB\Driver\Manager("mongodb://localhost:27017");
    // 插入数据 $bulk = new MongoDB\Driver\BulkWrite; 
    $bulk->insert(['x' => 1, 'name'=>'baidu', 'url' => 'http://www.baidu.com']);
    $bulk->insert(['x' => 2, 'name'=>'Google', 'url' => 'http://www.google.com']);
    $bulk->insert(['x' => 3, 'name'=>'taobao', 'url' => 'http://www.taobao.com']);
    $manager->executeBulkWrite('test.sites', $bulk);
    $filter = ['x' => ['$gt' => 1]];
    $options = [ 'projection' => ['_id' => 0], 'sort' => ['x' => -1], ];
    // 查询数据 $query = new MongoDB\Driver\Query($filter, $options); $cursor = $manager->executeQuery('test.sites', $query); foreach ($cursor as $document) { print_r($document); }
```
### 2. 使用官方扩展包

#### 安装
```
    composer require mongodb/mongodb
```
#### 使用
```php
    //连接 
    $client = new MongoDB\Client('mongodb://localhost:27017'); 
    //选择数据库 
    $db = $client->selectDatabase("db"); 
    //选择文档 
    $collection = $db->selectCollection("collection"); 
    //查询 
    $result = $collection->findOne(['name' => 'panda']); 
    //...
```
### 3. 在Yii中使用

> 我平时用Yii比较多，所以记录一下在Yii中的使用方法。

#### 安装
```
    composer require yiisoft/yii2-mongodb
```
#### 配置

在配置文件的 `components` 中加入
```php
    'mongodb' => [
            'class' => '\yii\mongodb\Connection', 
            'dsn' => 'mongodb://localhost:27017/dbName', 
            'options' => [
                "username" => "Username", 
                "password" => "Password"
            ]
        ],
```
#### 使用

1. 组件使用
```php
    $collection = Yii::$app->mongodb->getCollection ( 'user' ); 
    $res = $collection->insert ( [ 'name' => 'Panda', 'ag3' => 18 ] );
```
2. model中使用
与MySQL类似，创建一个model文件，继承 `yii\mongodb\ActiveRecord`
```php
    <?php
    
    namespace frontend\models;
    
    use Yii;
    use yii\db\ActiveRecord;
    
    /** * This is the model class for table "vote_log". * * @property int $id * @property int $user_id * @property int $post_id * @property string $post_type * @property int $created_at * @property int $updated_at * @property int $if_deleted */
    class VoteLog extends yii\mongodb\ActiveRecord
    {
        /** * 定义集合名称 注意是 collectionName，不是 tableName * {@inheritdoc} */
        public static function collectionName()
        {
            return 'vote_log';
        }
    
        /** * 定义规则 * {@inheritdoc} */
        public function rules()
        {
            return [[['user_id', 'post_id'], 'required'], [['user_id', 'post_id', 'created_at', 'updated_at', 'if_deleted'], 'integer'], [['user_id', 'post_id',], 'integer'], [['post_type'], 'string', 'max' => 20],];
        }
    
        /** * 定义字段 注意是 attributes，不是 attributeLabels * {@inheritdoc} */
        public function attributes()
        {
            return ['_id', 'id', 'user_id', 'post_id', 'post_type', 'created_at', 'updated_at', 'if_deleted',];
        }
    
        /** * 查找点赞记录 * @param $postId * @param $userId * @param int $ifDeleted */
        public static function findVoteLog($postId, $userId)
        {
            $voted = self::findOne(['post_id' => $postId, 'user_id' => $userId]);
            return $voted;
        }
    }
```
    

