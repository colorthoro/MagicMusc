<template>
  <div class="play-list-container">
    <div class="head">
      <span
        :class="{ 'active-black': listOrHistory === 1 }"
        @click="listOrHistory = 1"
      >
        播放列表
      </span>
      |
      <span
        :class="{ 'active-black': listOrHistory === 2 }"
        @click="listOrHistory = 2"
      >
        历史记录
      </span>
    </div>
    <div class="list" v-show="listOrHistory === 1">
      <el-scrollbar :always="showScrollBar">
        <li
          v-for="(song, index) of playingQ"
          :key="song.file_id"
          :class="{ active: audio && song.sameWith(recent) }"
        >
          <SongItem v-if="index < maxLenQ" :song="song" :del="del" />
        </li>
      </el-scrollbar>
    </div>
    <div class="list" v-show="listOrHistory === 2">
      <el-scrollbar>
        <li
          v-for="(hi, index) of historyList"
          :key="hi.file_id"
          :class="{ active: audio && hi.sameWith(recent) }"
        >
          <SongItem
            v-if="index < maxLenH"
            :song="hi"
            :showCnt="true"
            :delAble="false"
          ></SongItem>
        </li>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";
import SongItem from "../base/SongItem";
export default {
  data() {
    return {
      listOrHistory: 1,
      showScrollBar: true,
      timeout: null,
      maxLenQ: 1,
      maxLenH: 1,
      interval: null,
    };
  },
  computed: {
    ...mapState(usePlayingQStore, [
      "audio",
      "history",
      "historyList",
      "playingQ",
      "recent",
    ]),
  },
  methods: { ...mapActions(usePlayingQStore, ["del"]) },
  components: {
    SongItem,
  },
  mounted() {
    let i = 0;
    this.interval = setInterval(() => {
      console.log("interval");
      i = !i;
      !(
        (i && this.maxLenQ < this.playingQ.length && this.maxLenQ++) ||
        (this.maxLenH < this.historyList.length && this.maxLenH++) ||
        (this.maxLenQ < this.playingQ.length && this.maxLenQ++)
      ) && clearInterval(this.interval);
    }, 10);
    this.timeout = setTimeout(() => (this.showScrollBar = false), 1500);
  },
  beforeUnmount() {
    clearInterval(this.interval);
    console.log("bye playlist");
  },
};
</script>

<style lang="scss" scoped>
.play-list-container {
  // color: gray;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  .head {
    margin-bottom: 5px;
  }
  .active-black {
    font-weight: bold;
    color: black;
  }
  .active {
    color: var(--el-color-primary);
  }
  .list {
    width: 100%;
    height: 90%;
    cursor: pointer;
  }
}
</style>