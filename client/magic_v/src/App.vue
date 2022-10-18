<template>
  <login-or-register />
  <song-list />
  <play-bar />
  <lyric-fall />
</template>

<script>
import LoginOrRegister from "./components/loginOrRegister";
import SongList from "./components/SongList";
import PlayBar from "./components/PlayBar";
import LyricFall from "./components/LyricFall";

export default {
  name: "App",
  components: {
    SongList,
    LoginOrRegister,
    PlayBar,
    LyricFall,
  },
};
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
