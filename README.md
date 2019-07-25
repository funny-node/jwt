# jwt 实现权限验证

```bash
# 前端
$ npm run dev

# 后端，确保 3000 端口没被占用
$ npm run dev
```

合法的账户名和密码是 `fish` `123`

---

关于 token 到底存的是什么东西，可以参考阮一峰的 [这篇文章](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

简单的说，一个 token 可以用 `.` 分为三部分，分别是：

* Header（头部）
* Payload（负载）
* Signature（签名）

比如这样一个 token：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZpc2giLCJpYXQiOjE1NjQwNTgxNzUsImV4cCI6MTU2NDA1ODE4MH0.qkt_SpFS5I_HlMUqf0Z7MaWjuIQpwMk_K1I8mqp1hxk
```

解析结果如下：(chrome dev 下)

```
atob('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') // "{"alg":"HS256","typ":"JWT"}"
atob('eyJ1c2VybmFtZSI6ImZpc2giLCJpYXQiOjE1NjQwNTgxNzUsImV4cCI6MTU2NDA1ODE4MH0') // "{"username":"fish","iat":1564058175,"exp":1564058180}"
```

可以知道，一二两部分其实都是明文（base64 了而已），第三部分才是真正携带的身份信息

简单来说，相对于 session 验权方案将用户信息放在后端（数据库，文件，redis 中等等）的做法，**jwt 是把用户信息加密后直接存储在了前端**

请求中发送 token 而不再是发送 cookie 能够防止 CSRF (跨站请求伪造)

## 需求

页面共有三个路由：

* `/` 用户主页，需要登录，未登录状态下会重定向到登录页 
* `/about` 该页面不需要登录
* `/login` 登录页，已登录状态下会重定向到用户主页

## 页面权限判断

前后端都需要做权限判断，前端在 router.forEach 导航守卫钩子里做，后端在接口里做。因为前端的权限认证都是假的，很容易就能绕过去（怎么绕？修改前端代码呗，毕竟前端代码都是可见的）

先说后端权限验证，我觉得后端权限验证比前端验证简单，前端请求拦截让每个请求都会带上 token（如果有的话），后端会有一个中间件专门分析这个 token（现成的可以直接用 [koa-jwt](https://github.com/koajs/jwt)），分析得到真实用户信息。后端会有一个请求白名单（即不需要权限认证的请求列表），如果是白名单内的请求，则该中间件不做处理，如果需要权限认证，那么查看 token 分析结果，如果是合法用户，则返回结果，如果不是，接口返回用户未登录

相应的，前端请求如果返回用户未登录，则清除本地保存的 token，并重定向到登录页。当然我们前端在导航守卫的时候还需要做权限认证，因为如果只根据接口返回来做权限认证的话，有些未登录状态下不能进去的页面，还是可以进去的（页面路由会改变），只是接口请求返回后才会被重定向，所以每次导航守卫的时候，我们需要根据 token 去验证用户权限，并给 token "续命"，这点感觉非常消耗性能，但是如果不这样做的话，就会有上述两个问题，一是页面进去后才被重定向到登录页，二是 token 不能 "续命"，可能之前还是登录状态，几分钟后 token 到期了，就 logout 了，实际上这段时间一直在操作，这样用户体验就不好

关于 token 的有效时间，在 server/app.js 中的 expiresIn 变量中设置

## TODO

当然完善这个应用还需要几点

1. 用户提交的密码需要加密存储，比如 md5
2. 前端直接存储 token 有风险（xss 攻击获取 localStorage 数据），可以考虑用服务端 set-cookie 来存储（开启 http-only）
3. 目前后端程序其实都是返回 200 状态码，所以并不会进入 Promise 的 catch 中，真实开发中可能 401 是根据状态码定义的（另可能会返回其他状态码），所以要做好 Promise.catch 的容错
4. axios 的可以对请求返回进行拦截，如果是 401 未授权，则重定向到登录页，可以在这里统一处理接口报错等（但是 demo 中不需要这步骤，因为导航守卫钩子里会请求 /authorization 接口，所以这个请求结果处理了 401，而不会进入到具体页面再去处理）

## 其他

### CAS

CAS（Central Authentication Service）是 sso 的一种实现

假设现在有两个系统 taobao.com（A）和 tmall.com（B），一个 sso 中心 sso.com

用户访问 A，系统 A 发现用户没有登录，于是重定向到 sso 认证中心，并将自己的地址作为参数：

```
sso.com?service=taobao.com
```

sso 认证中心发现用户未登录，将用户引导到登陆页。用户登录后，用户和 sso 认证中心建立 **全局会话**（生成 token 保存在 cookie 中，作为用户凭证）

随后，从认证中心重定向回系统 A，并把 token 携带过去给系统 A（invitation-manager cas 认证成功后没有看到重定向 url 携带 token）

```
taobao.com?token=xxx
```

接着，系统 A 去 sso 认证中心验证这个 token 是否合法，如果合法，系统 A 和用户建立局部会话（创建 Session）。至此，系统 A 和用户已经是登录状态

此时，用户想要访问 B，系统 B 发现用户未登录，重定向到 sso 认证中心，并将地址作为参数：

```
sso.com?service=tmall.com
```

之前用户与认证中心已经建立了全局会话，于是重定向回系统 B，并把 token 携带过去：

```
tmall.com?token=xxx
```

实际开发中，如果 A 登录后，打开 B，并没有看到重定向过程，我猜测这个验权过程是静默的，sso 登录后重定向回 A 的过程，也没看到 url 上携带 token，我猜打开 A 的时候，服务端可以直接获取 sso 的登录状态，也就是一旦 sso 处于登录状态，那 A 和 B 就能随意打开了

### session

缺点：

* 服务器需要保存所有人的 sessionId
* 多个机器之间需要做 session 共享（当然也可以用 session sticky，让某个 session 一直黏在一个机器上，也可以做 session 复制，但是要累死）
* 以上这个问题可以用 redis/memcached 解决，但是 redis/memcached 挂了的话，所有人都要重新登录（可以把这个单点的机器也搞出集群，增加可靠性）
* 我为什么要保存这可恶的 session 呢， 只让每个客户端去保存该多好？于是有了 jwt
