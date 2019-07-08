import axios from 'axios'
import { getToken } from '@/utils/token'

// 这里通常应该根据环境判断
const baseURL = 'http://localhost:3000'

const request = axios.create({
  baseURL,
  timeout: 15000,
})

// 请求拦截，可以在这里增加 headers 设置等
request.interceptors.request.use(config => {
  config.headers['Authorization'] = getToken()

  return config
}, error => {
  Promise.reject(error)
})

// 返回拦截，可以在这里统一做错误处理
request.interceptors.response.use(
  response => {
    // 只返回 data
    // response <https://github.com/axios/axios#response-schema>

    return response.data
    
    // if (res.code === 401) {
    //   router.push({name: 'login'})
    // }
  },
  error => {
    return Promise.reject(error)
  }
)

export default request
