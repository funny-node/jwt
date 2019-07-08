import router from './router'
import { getToken, setToken } from '@/utils/token'
import store from './store'

// 路由白名单列表
const whiteUrlList = [
  '/about',
]

router.beforeEach((to, from, next) => {
  // 如果是白名单中的路由，则直接跳转
  if (whiteUrlList.includes(to.path)) {
    next()
  } else {
    const token = getToken()

    // 如果有 token，则验证 token
    if (token) {
      store.dispatch('authorization').then(() => {
        // 合法用户
        if (to.name === 'login') {
          next({name: 'home'})
        } else {
          next()
        }
      }).catch(err => {
        // token 错误，删除 token
        setToken('')
        if (to.name === 'login') next()
        else next({name: 'login'})
      })
    } else {
      // 没有 token，那肯定是没登录了
      if (to.name === 'login') next()
      else next({name: 'login'})
    }
  }
})
