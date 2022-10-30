<template>
  <div class="item" @click.stop="playAble && play(song)">
    <FlowText class="name" :text="song.name"></FlowText>
    <FlowText class="author" :text="song.author" v-if="showAuthor"></FlowText>
    <FlowText class="cnt" :text="song.cnt" v-if="showCnt"></FlowText>
    <font-awesome-icon
      v-if="resotrable"
      class="addons red-hover"
      icon="fa-solid fa-trash-arrow-up"
      @click.stop="putIntoList([song], 'allSongs')"
    />
    <font-awesome-icon
      v-if="delAble"
      class="addons red-hover"
      icon="fa-regular fa-circle-xmark"
      @click.stop="if (del) del(song);"
    />
    <font-awesome-icon
      v-if="delAble"
      class="addons red-hover"
      icon="fa-solid fa-plus"
      @click.stop="modify"
    />
    <font-awesome-icon
      class="addons red-hover"
      :style="{
        color: isLiked ? 'red' : '',
        display: isLiked ? 'inline-block' : '',
      }"
      @click.stop="
        isLiked ? delFromList([song], 'liked') : putIntoList([song], 'liked')
      "
      icon="fa-regular fa-heart"
    />
    <!-- <div v-if="delAble" class="del" @click.stop="if (del) del(song);">删除</div> -->
  </div>
</template>

<script>
import FlowText from "./FlowText.vue";
import { mapActions, mapState } from "pinia";
import usePlayingQStore from "../store/playingQ";
import useSongListsStore from "../store/songLists";
import useBackStore from "../store/back";
import { Song } from "../tools/songsCache";
export default {
  props: {
    song: {
      type: Song,
      required: true,
    },
    showAuthor: {
      type: Boolean,
      default: false,
    },
    showCnt: {
      type: Boolean,
      default: false,
    },
    playAble: {
      type: Boolean,
      default: true,
    },
    delAble: {
      type: Boolean,
      default: true,
    },
    del: {
      type: Function,
      default: null,
    },
    resotrable: {
      // 显示上只有回收站列表里需要提供还原选项，也就不自行计算了。
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useSongListsStore, ["targetList"]),
    ...mapState(useBackStore, ["modifyDialog"]),
    isLiked() {
      return this.targetList("liked").get(this.song.file_id);
    },
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play"]),
    ...mapActions(useSongListsStore, ["putIntoList", "delFromList"]),
    modify() {
      this.modifyDialog.targetSongs = [this.song];
      this.modifyDialog.need = true;
    },
  },
  beforeUnmount() {
    console.log("bye songItem");
  },
  components: {
    FlowText,
  },
};
</script>

<style scoped>
.item {
  display: flex;
  justify-content: space-between;
}
.name,
.author,
.cnt {
  height: 2em;
  line-height: 2em;
  margin: 0 0.5em;
}
.name {
  flex: 3 1 60%;
}
.author {
  flex: 1 1 35%;
}
.cnt {
  flex: 1 1 15%;
}
.addons {
  display: none;
  color: gray;
  height: 1em;
  padding: 0.5em;
}
.item:hover .addons {
  display: inline-block;
}
</style>