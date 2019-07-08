<template>
  <div class="home">
    欢迎回来 {{ username }}
    <button @click="handleLogout">logout</button>
  </div>
</template>

<script>
import { user } from '@/api/user'
import { mapActions } from 'vuex'

export default {
  name: 'home',
  data () {
    return {
      username: ''
    }
  },
  created () {
    user().then(res => {
      this.username = res.data.username
    }).catch(err => console.log(err))
  },
  methods: {
    ...mapActions(['logout']),
    handleLogout () {
      this.logout().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    }
  }
}
</script>