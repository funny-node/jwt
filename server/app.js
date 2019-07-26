const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')
const jwtKoa = require('koa-jwt')
const Router = require('koa-router')
const secret = 'secret key'
const expiresIn = 500

const app = new Koa()
const router = new Router()

// 模拟的合法用户
const users = [{
  username: 'fish',
  password: '123',
}]

// 判断用户是否是合法用户
function isValidUser(user) {
  return users.some(item => item.username === user.username && item.password === user.password)
}

app.use(cors())
app.use(bodyParser())

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 200
      ctx.body = {
        code: 401,
        msg: 'token error'
      }
    } else {
      throw err
    }
  })
})

/**
 * 中间件解析 authorization 验证是否是登录用户
 * unless 为接口白名单
 */
app.use(jwtKoa({ secret }).unless({ path: [/^\/login/, /^\/about/] }))

// 验证是否已登录，如果未登录，会直接在前一个中间件返回，不会进入这个接口代码逻辑中
// 因为该接口并不在白名单范围内（也可以设置成该接口为白名单，然后未登录用户在这里返回 401）
router.get('/authorization', (ctx, next) => {
  const info = ctx.state.user // info 除了 username 还有其他 keys
  const payload = { username: info.username }

  const token = jwt.sign(payload, secret, {
    expiresIn
  })

  ctx.body = {
    code: 200,
    msg: 'success',
    data: {
      // 生成新的 token，给 token “续命”
      token
    }
  }
})

// 登录接口
router.post('/login', (ctx, next) => {
  const {
    username,
    password
  } = ctx.request.body

  if (isValidUser({ username, password })) {
    // 登录成功，生成 token
    const payload = {
      username
    }
    
    const token = jwt.sign(payload, secret, {
      expiresIn
    })

    ctx.body = {
      code: 200,
      msg: 'success',
      data: {
        token
      }
    }
  } else {
    ctx.body = {
      code: 401,
      msg: 'username or password is wrong!'
    }
  }
})

// about 接口，为开放接口
router.get('/about', (ctx, next) => {
  ctx.body = {
    code: 200,
    msg: 'success',
    data: {
      msg: '这个一个 public 的页面，非登录用户也能看到'
    }
  }
})

// 获取用户信息的接口
router.get('/user', (ctx, next) => {
  const payload = ctx.state.user

  ctx.body = {
    code: 200,
    msg: 'success',
    data: payload
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000)
