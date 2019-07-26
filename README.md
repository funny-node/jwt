# koa-jwt

master 分支实际上是自己实现了一个简易的 koa jwt 中间件，实际上可以用现成的 koa-jwt 模块

几个注意点：

* 前端发送 token 的时候需要加上 `Bearer ` 前缀，这也是业界标准，如果没带，会被判为非法 token
* 后端 payload 用 `ctx.state.user` 获取，如果 sign 的时候 payload 是 `{username: username}`，那么获取的时候这样 `ctx.state.user.username`（注意 `ctx.state.user` 对象还有其他 key)