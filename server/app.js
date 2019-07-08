const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')
const Router = require('koa-router')
const secret = 'secret key'
const expiresIn = 5

const app = new Koa()
const router = new Router()

// 接口白名单
const whiteUrlList = {
  'get': ['/about'],
  'post': ['/login']
}

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

/**
 * 中间件解析 authorization 验证是否是登录用户
 */
app.use((ctx, next) => {
  const path = ctx.request.path.toLowerCase()
  const method = ctx.request.method.toLowerCase()

  // 如果是白名单接口，直接 next
  if (whiteUrlList[method] && whiteUrlList[method].includes(path)) {
    next()
  } else {
    const token = ctx.request.headers['authorization']

    jwt.verify(token, secret, (error, decode) => {
      if (error) {
        // token error
        ctx.body = {
          code: 401,
          msg: 'token error'
        }
      } else {
        ctx.username = decode.username
        next()
      }
    })
  }
})

// 验证是否已登录，如果未登录，会直接在前一个中间件返回，不会进入这个接口代码逻辑中
// 因为该接口并不在白名单范围内（也可以设置成该接口为白名单，然后未登录用户在这里返回 401）
router.get('/authorization', (ctx, next) => {
  const username = ctx.username

  ctx.body = {
    code: 200,
    msg: 'success',
    data: {
      // 生成新的 token，给 token “续命”
      token: jwt.sign({
        username: username
      }, secret, {
        expiresIn
      })
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
    const token = jwt.sign({
      username: username
    }, secret, {
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
  const username = ctx.username

  ctx.body = {
    code: 200,
    msg: 'success',
    data: {
      username
    }
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000)
