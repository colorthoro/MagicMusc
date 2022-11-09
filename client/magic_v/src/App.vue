<template>
  <!-- <login-or-register /> -->
  <div class="myWindow">
    <div class="bg"></div>
    <AddTo></AddTo>
    <button @click="test = !test">test</button>
    <song-list v-if="test" />
  </div>
  <play-bar v-if="test" :height="playBarH" />
  <!-- <lyric-fall /> -->
</template>

<script>
/* eslint-disable */
import LoginOrRegister from "./components/loginOrRegister.vue";
import SongList from "./components/SongList.vue";
import LyricFall from "./components/LyricFall.vue";
import PlayBar from "./components/PlayBar.vue";
import AddTo from "./components/AddTo.vue";
import usePlayingQStore from "@/store/playingQ";
import usePicsStore from "@/store/pics";
import { mapState, mapActions } from "pinia";

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
      picUrlReciver: { id: 0, url: null },
    };
  },
  computed: {
    ...mapState(usePlayingQStore, ["recent"]),
  },
  methods: {
    ...mapActions(usePicsStore, ["getPicUrl", "losePicUrl"]),
  },
  watch: {
    recent: {
      immediate: true,
      handler() {
        this.losePicUrl(this.picUrlReciver.url);
        this.getPicUrl(this.recent, this.picUrlReciver);
      },
    },
  },
};
</script>

<style lang="scss">
@import "style/index.scss";
.bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
  background-image: v-bind("`url(${picUrlReciver.url})`");
  background-size: cover;
  background-position: center;
  filter: blur(20px);
}
</style>
