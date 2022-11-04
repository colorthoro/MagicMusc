<template>
  <!-- <login-or-register /> -->
  <div class="myWindow">
    <AddTo></AddTo>
    <button @click="test = !test">test</button>
    <song-list v-if="test" />
  </div>
  <play-bar :height="playBarH" />
  <!-- <lyric-fall /> -->
</template>

<script>
/* eslint-disable */
import LoginOrRegister from "./components/loginOrRegister.vue";
import SongList from "./components/SongList.vue";
import LyricFall from "./components/LyricFall.vue";
import PlayBar from "./components/PlayBar.vue";
import AddTo from "./components/AddTo.vue";

export default {
  name: "App",
  components: {
    LoginOrRegister,
    SongList,
    LyricFall,
    PlayBar,
    AddTo,
  },
  data() {
    return {
      test: true,
      playBarH: "3rem",
    };
  },
};
</script>

<style lang="scss">
@import "style/index.scss";
</style>
