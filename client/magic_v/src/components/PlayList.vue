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
      <el-auto-resizer>
        <template #default="{ height }">
          <VirtualList
            :height="height"
            :list="playingQ.map((v) => ({ id: v.file_id, data: v }))"
          >
            <template #default="{ item: song }">
              <SongItem
                :song="song"
                :del="del"
                :class="{ active: audio && song.sameWith(recent) }"
              />
            </template>
          </VirtualList>
        </template>
      </el-auto-resizer>
    </div>
    <div class="list" v-show="listOrHistory === 2">
      <el-auto-resizer>
        <template #default="{ height }">
          <VirtualList
            :height="height"
            :list="historyList.map((v) => ({ id: v.file_id, data: v }))"
          >
            <template #default="{ item: song }">
              <SongItem
                :song="song"
                :showCnt="true"
                :delAble="false"
                :class="{ active: audio && song.sameWith(recent) }"
              />
            </template>
          </VirtualList>
        </template>
      </el-auto-resizer>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";
import SongItem from "../base/SongItem";
import VirtualList from "../base/VirtualList.vue";
export default {
  data() {
    return {
      listOrHistory: 1,
    };
  },
  computed: {
    ...mapState(usePlayingQStore, [
      "audio",
      "historyList",
      "playingQ",
      "recent",
    ]),
  },
  methods: { ...mapActions(usePlayingQStore, ["del"]) },
  components: { SongItem, VirtualList },
};
</script>

<style lang="scss" scoped>
.play-list-container {
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