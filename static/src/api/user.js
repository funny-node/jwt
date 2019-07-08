import request from '@/utils/request'

export const login = ({ username, password }) => {
  return request({
    url: '/login',
    method: 'post',
    data: {
      username, password
    }
  })
}

export const authorization = () => {
  return request({
    url: '/authorization'
  })
}

export const about = () => {
  return request({
    url: '/about'
  })
}

export const user = () => {
  return request({
    url: '/user'
  })
}