<template>
  <el-tabs
    class="songlists"
    stretch
    type="card"
    addable
    v-model="activeTabName"
    @tab-remove="tabRemoveHandler"
    @tab-add="tabAddHandler"
  >
    <el-tab-pane
      v-for="list of allLists"
      :key="list"
      :label="isInnerList(list) || list"
      :name="list"
      :closable="!isInnerList(list)"
    >
      <div style="height: 30vh">
        <VirtualListHead style="height: 2em" v-model:checkStatus="test">
          <SongItemAddons
            :config="{
              trashUp: {
                need: list === 'binSongs',
                func: () =>
                  putIntoList($refs[list][0].popCheckedItems(), 'allSongs'),
              },
              del: {
                need: true,
                func: () => delFromList($refs[list][0].popCheckedItems(), list),
              },
              plus: {
                need: true,
                func: () => callModifyDialog($refs[list][0].popCheckedItems()),
              },
              more: {
                need: true,
              },
              cloudDown: {
                need: true,
                func: () => cloudDownFunc(),
              },
            }"
          />
        </VirtualListHead>
        <el-auto-resizer style="height: calc(30vh - 2em)">
          <template #default="{ height }">
            <VirtualList
              :height="height"
              :list="this.nowListSongs"
              id_field="file_id"
              v-model:checkStatus="test"
              :ref="list"
            >
              <template #default="{ item: song }">
                <SongItem
                  :song="song"
                  :del="(song) => delFromList([song], list)"
                  :restorable="list === 'binSongs'"
                />
              </template>
            </VirtualList>
          </template>
        </el-auto-resizer>
      </div>
    </el-tab-pane>
    <el-tab-pane v-if="addingNewList" :name="addingNewListTempTabName">
      <template #label>
        <div @mouseover="$refs.listNameInput.click()">
          <InputBtn
            ref="listNameInput"
            text="输入歌单名"
            :validator="null"
            @res="listNameInputResHandler"
            style="width: 5em"
          ></InputBtn>
        </div>
      </template>
    </el-tab-pane>
  </el-tabs>
  <button v-if="activeTabName === 'allSongs'" @click="getAllSongsFromCloud">
    扫描云端
  </button>
  <button @click="play(nowListSongs)">播放当前歌单全部</button>
  <div class="main"></div>
</template>

<script>
import { onMounted, onBeforeUnmount } from "vue";
import { mapState, mapActions } from "pinia";
import useSongListsStore from "../store/songLists";
import usePlayingQStore from "../store/playingQ";
import InputBtn from "../base/InputBtn.vue";
import SongItem from "../base/SongItem.vue";
import SongItemAddons from "../base/SongItemAddons.vue";
import VirtualList from "../base/VirtualList.vue";
import VirtualListHead from "../base/VirtualListHead.vue";

export default {
  name: "SongList",
  components: {
    InputBtn,
    SongItem,
    SongItemAddons,
    VirtualList,
    VirtualListHead,
  },
  data() {
    return {
      addingNewList: false,
      addingNewListTempTabName: "temp-asdfjkadnv",
      activeTabName: "allSongs",
      lastTabName: "allSongs",
      test: "noChecked",
    };
  },
  computed: {
    ...mapState(useSongListsStore, ["allLists", "targetList", "isInnerList"]),

    nowList() {
      return this.targetList(
        this.activeTabName === this.addingNewListTempTabName
          ? this.lastTabName
          : this.activeTabName
      );
    },
    nowListSongs() {
      return [...this.nowList.values()];
    },
  },
  methods: {
    ...mapActions(useSongListsStore, [
      "putIntoList",
      "delFromList",
      "clearList", // TODO
      "getAllSongsFromCloud",
      "addNewList",
      "delList",
      "callModifyDialog",
    ]),
    ...mapActions(usePlayingQStore, ["play", "addNextPlay", "addQueuePlay"]), // TODO
    tabRemoveHandler(name) {
      let i = this.allLists.indexOf(name);
      this.delList(name);
      if (this.activeTabName === name)
        this.activeTabName = this.allLists[i] || this.allLists[i - 1];
    },
    tabAddHandler() {
      !this.addingNewList && (this.addingNewList = true);
      this.lastTabName = this.activeTabName;
      this.activeTabName = this.addingNewListTempTabName;
      setTimeout(() => {
        this.$refs.listNameInput.click();
      }, 1000); // 等 el-tabs 模拟滚动结束再触发点击
    },
    listNameInputResHandler(name) {
      this.addingNewList = false;
      this.activeTabName = this.lastTabName;
      if (!name.length) return;
      this.addNewList(name);
      this.activeTabName = name;
    },
    async cloudDownFunc() {
      let k = 0;
      for (let song of this.$refs[this.activeTabName][0].popCheckedItems()) {
        if ((await song.fetch()) instanceof Blob) console.log(++k);
      }
      return k;
    }, // TODO
  },
  setup() {
    let clickAddIcon;
    onMounted(() => {
      // 新建歌单快捷键
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

<style scoped>
.songlists {
  height: 50vh;
  width: 20em;
}
.songlists :deep(.el-tabs__header) {
  margin-bottom: 1px;
}
</style>