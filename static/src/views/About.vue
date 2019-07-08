<template>
  <div>{{ content }}</div>
</template>

<script>
import { about } from '@/api/user'

export default {
  name: 'about',
  data () {
    return {
      content: ''
    }
  },
  created () {
    about().then(res => {
      this.content = res.data.msg
    }).catch(err => console.log(err))
  }
}
</script>
