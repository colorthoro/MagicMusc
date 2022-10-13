<template>
  <div>
    <div class="container">
      <button @click="last">上一首</button>
      <button @click="onOff">暂停/开始</button>
      <button @click="next">下一首</button>
      播放列表：
      <div v-for="song of playingQ" :key="song.file_id">
        {{ song.name }} {{ song === recent ? "***" : "---" }}
        <button @click="del(song)">删除</button>
        <button @click="play(song)">播放</button>
      </div>
      历史列表：
      <div v-if="history.normal.length">
        <div v-for="hi of historyList" :key="hi.file_id">
          {{ hi.name }}
          <button @click="play(hi)">播放</button>
        </div>
      </div>
      <!-- normal:
      <div v-for="hi of history.normal" :key="hi.file_id">
        {{ hi.name }}
      </div>
      recur:
      <div v-for="hi of history.recur" :key="hi.file_id">
        {{ hi.name }}
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState, mapWritableState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";

export default {
  name: "PlayBar",
  data: () => ({}),
  computed: {
    ...mapWritableState(usePlayingQStore, ["playingQ", "history", "playOrder"]),
    ...mapState(usePlayingQStore, ["historyList", "recent", "audio"]),
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play", "del", "onOff", "next", "last"]),
  },
};
</script>

<style>
</style>