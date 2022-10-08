<template>
  <login-or-register/>
  <song-list/>
</template>

<script>
import LoginOrRegister from './components/loginOrRegister.vue'
import SongList from './components/SongList'

export default {
  name: 'App',
  components: {
    SongList,
    LoginOrRegister,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
