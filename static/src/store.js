import Vue from 'vue'
import Vuex from 'vuex'
import { login, authorization } from '@/api/user'
import { setToken } from '@/utils/token'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: {
    login ({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        login({ 
          username, 
          password
        }).then(res => {
          if (res.code === 200) {
            const { token } = res.data
            setToken(token)
            resolve()
          } else if (res.code === 401) {
            reject(res.msg)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    logout () {
      return new Promise((resolve, reject) => {
        setToken('')
        resolve()
      })
    },
    authorization () {
      return new Promise((resolve, reject) => {
        authorization().then(res => {
          if (res.code === 401) reject('token error')
          else if (res.code === 200) {
            // token 这里续命
            setToken(res.data.token)
            resolve() 
          }
        }).catch(err => reject(err))
      })
    }
  }
})
 