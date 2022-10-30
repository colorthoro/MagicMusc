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
import { defineAsyncComponent } from "vue";
import LoginOrRegister from "./components/loginOrRegister";
import SongList from "./components/SongList";
import LyricFall from "./components/LyricFall";
const PlayBar = defineAsyncComponent(() => import("./components/PlayBar"));
const AddTo = defineAsyncComponent(() => import("./components/AddTo"));

export default {
  name: "App",
  data() {
    return {
      test: true,
      playBarH: "3rem",
    };
  },
  components: {
    SongList,
    LoginOrRegister,
    PlayBar,
    LyricFall,
    AddTo,
  },
};
</script>

<style lang="scss">
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.myWindow {
  width: 100%;
  height: v-bind("'calc(100vh - ' + playBarH + ')'");
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
