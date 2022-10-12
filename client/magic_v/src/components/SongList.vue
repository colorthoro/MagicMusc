<template>
  <div>
    <div class="container">
      <button class="control" @click="getAllSongsFromCloud">
        点我获取全部云音乐
      </button>
      <button @click="Play([...allSongs.values()])">播放全部</button>
      <button @click="pause">暂停播放</button>
      <button @click="last">上一首</button>
      <button @click="next">下一首</button>
      <div class="all">
        <div class="song" v-for="song of allSongs.values()" :key="song.file_id">
          {{ song.name }}
          <button
            @click="delFromList({ id: song.file_id, listName: 'allSongs' })"
          >
            删除
          </button>
          <button @click="song.fetch()">获取</button>
          <button @click="Play(song)">播放</button>
        </div>
      </div>
      <div class="bin">
        以下是回收站文件
        <div class="song" v-for="song of binSongs.values()" :key="song.file_id">
          {{ song.name }}
          <button
            @click="delFromList({ id: song.file_id, listName: 'binSongs' })"
          >
            删除
          </button>
        </div>
      </div>
      <button class="control" @click="clearList({ listName: 'binSongs' })">
        点我删除回收站全部音乐
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import useSongListsStore from "../store/songLists";
import usePlayingQStore from "../store/playingQ";

export default {
  name: "SongList",
  data() {
    return {};
  },
  computed: {
    ...mapState(useSongListsStore, ["allSongs", "binSongs"]),
  },
  methods: {
    ...mapActions(useSongListsStore, [
      "delFromList",
      "clearList",
      "getAllSongsFromCloud",
    ]),
    ...mapActions(usePlayingQStore, ["Play", "pause", "next", "last"]),
  },
};
</script>

<style>
</style>