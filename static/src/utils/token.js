export const setToken = (token, tokenName = 'auth') => {
  localStorage.setItem(tokenName, token)
}

export const getToken = (tokenName = 'auth') => {
  return localStorage.getItem(tokenName)
}