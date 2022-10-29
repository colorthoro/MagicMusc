<template>
  <el-tabs
    class="songlists"
    stretch
    type="card"
    addable
    v-model="activeTabName"
    @tab-remove="removeTab"
    @tab-add="toAddNewList"
  >
    <el-tab-pane
      v-for="list of allLists"
      :key="list"
      :label="isInnerList(list) || list"
      :name="list"
      :closable="!isInnerList(list)"
    >
    </el-tab-pane>
    <el-tab-pane v-if="addingNewList" :name="addingNewListTempTabName">
      <template #label>
        <div @mouseover="clickInput">
          <InputBtn
            ref="listNameInput"
            text="输入歌单名"
            @res="finishAddNewList"
            style="width: 5em"
          ></InputBtn>
        </div>
      </template>
    </el-tab-pane>
  </el-tabs>
  <button v-if="activeTabName === 'allSongs'" @click="getAllSongsFromCloud">
    扫描云端
  </button>
  <button @click="play([...nowList.values()])">播放当前歌单全部</button>
</template>

<script>
import { onMounted, onBeforeUnmount } from "vue";
import { mapState, mapActions } from "pinia";
import useSongListsStore from "../store/songLists";
import usePlayingQStore from "../store/playingQ";
import InputBtn from "../base/InputBtn.vue";
// import SongItem from "../base/SongItem.vue";

export default {
  name: "SongList",
  data() {
    return {
      addingNewList: false,
      addingNewListTempTabName: "temp-asdfjkadnv",
      activeTabName: "allSongs",
      lastTabName: "allSongs",
      maxLen: 1,
    };
  },
  components: { InputBtn },
  computed: {
    ...mapState(useSongListsStore, ["allLists", "targetList"]),
    nowList() {
      if (this.activeTabName === this.addingNewListTempTabName)
        return this.targetList(this.lastTabName);
      return this.targetList(this.activeTabName);
    },
  },
  methods: {
    ...mapActions(useSongListsStore, [
      "delFromList",
      "clearList",
      "getAllSongsFromCloud",
      "addNewList",
      "delList",
      "isInnerList",
    ]),
    ...mapActions(usePlayingQStore, ["play", "addNextPlay", "addQueuePlay"]),
    removeTab(name) {
      let i = this.allLists.indexOf(name);
      this.delList(name);
      if (this.activeTabName === name)
        this.activeTabName = this.allLists[i] || this.allLists[i - 1];
    },
    toAddNewList() {
      this.addingNewList = true;
      setTimeout(() => {
        this.$refs.listNameInput.click();
      }, 1000); // 等 el-tabs 模拟滚动相关计算结束再触发点击
      this.lastTabName = this.activeTabName;
      this.activeTabName = this.addingNewListTempTabName;
    },
    clickInput() {
      this.$refs.listNameInput.click();
    },
    finishAddNewList(name) {
      this.addNewList(name);
      this.addingNewList = false;
      this.activeTabName = name;
    },
  },
  setup() {
    let clickAddIcon;
    onMounted(() => {
      clickAddIcon = (e) => {
        if (e.ctrlKey && e.altKey && e.code === "KeyN") {
          document.querySelector(".el-tabs__new-tab").click();
        }
      };
      document.addEventListener("keydown", clickAddIcon, { passive: true });
    });
    onBeforeUnmount(() => {
      document.removeEventListener("keydown", clickAddIcon);
    });
  },
};
</script>

<style lan="scss" scoped>
.songlists {
  height: 50vh;
  width: 20em;
}
.songlists :deep(.el-tabs__item.is-disabled) {
  color: var(--el-text-color-primary);
  cursor: pointer;
}
.songlists :deep(.el-tabs__header) {
  margin-bottom: 1px;
}
</style>