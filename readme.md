## 目的

模拟一个koa， 学习koa设计和原理，学习nodejs。 ikoajs为学习使用，**不建议使用在生产环境**。

## 备注 

fork了[koajs](https://github.com/koajs/koa)，删除整个核心代码， 使用koa的测试用例测试和学习。

ikoajs组织中的repo，为个人积累使用，如果您觉得好用，或者对您有帮助，欢迎star；
若您觉得可以修正的更好，欢迎提issue，提pull request。

## TODO

### ikoa

- [x] 制定计划，规范代码，基于eslint修改成自己的习惯
- [x] 创建一个http server
- [] 异常处理
- [] 委托实现

注: 开发中的 ctx, response, request使用koa的习惯， 实现 [delegates](./lib/helper/Delegates.js)

### 中间件

要求: 中间件支持koa，每个中间件功能明确单一职责。避免过多的重复造轮子，若有好的轮子不足则fork修改

- [ ] ikoa-router支持集中式管理
- [ ] ikoa-session提供不同的介质存储
- [ ] ikoa-static可以处理各种文件格式，该层不做压缩等处理，压缩交于nginx统一处理或其他koa-compress处理
- [ ] ikoa-view 支持常见模板功能
- [ ] ikoa-mock koa中使用mock，使用于中间层和底层端调试







