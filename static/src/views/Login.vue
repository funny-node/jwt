<template>
  <div>
    <input v-model="username"/>
    <input v-model="password" type="password"/>
    <input type="button" value="login" @click="handleLogin"/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'login',
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(['login']),
    handleLogin () {
      const username = this.username
      const password = this.password

      this
        .login({username, password})
        .then(() => { // 登录成功
          this.$router.push({name: 'home'})
        })
        .catch(err => { // 登录失败
          alert(err)
        })
    }
  }
}
</script>