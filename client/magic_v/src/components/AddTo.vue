<template>
  <el-dialog
    ref="dialog"
    v-model="visible"
    title="添加到歌单"
    width="30%"
    align-center
    center
  >
    <el-scrollbar height="10em">
      <el-checkbox-group class="vertical-center-flex" v-model="checkedList">
        <el-checkbox
          v-for="list of addableLists"
          :label="list"
          :key="list"
          border
        />
      </el-checkbox-group>
    </el-scrollbar>
    <template #footer>
      <div>
        <el-scrollbar height="2em">
          <li
            class="sipName"
            v-for="song of modifyDialog.targetSongs"
            :key="song.file_id"
          >
            {{ song.name }}
          </li>
        </el-scrollbar>
        <span class="info" v-if="modifyDialog.targetSongs.length > 1">
          注意，选中多个歌曲后，只会将这些歌曲新增到选中的歌单，而不会依据此页面从歌单删除。
        </span>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirm" :loading="moving">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import useSongListsStore from "../store/songLists";
import useBackStore from "../store/back";
import { mapState, mapActions } from "pinia";
export default {
  data() {
    return {
      moving: false,
      checkedList: [],
    };
  },
  computed: {
    ...mapState(useSongListsStore, ["addableLists", "isInnerList"]),
    ...mapState(useBackStore, ["modifyDialog"]),
    visible: {
      get() {
        return this.modifyDialog.need;
      },
      set(val) {
        this.modifyDialog.need = val;
      },
    },
  },
  methods: {
    ...mapActions(useSongListsStore, ["syncTags"]),
    confirm() {
      //   this.moving = true;
      this.syncTags(
        this.modifyDialog.targetSongs,
        this.checkedList,
        this.modifyDialog.targetSongs.length === 1
      );
      //   this.moving = false;
      this.visible = false;
      this.modifyDialog.targetSongs.length = 0;
    },
  },
  watch: {
    visible(newV) {
      if (newV) {
        this.modifyDialog.need &&
          this.modifyDialog.targetSongs.length === 1 &&
          (this.checkedList = [...this.modifyDialog.targetSongs[0].tags]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sipName {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.vertical-center-flex {
  display: flex;
  flex-direction: column;
  &:deep(.el-checkbox) {
    margin: 0;
  }
}
</style>