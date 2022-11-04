<template>
  <div class="song-item" @click.stop="playAble && play(song)">
    <FlowText class="name" :text="song.name"></FlowText>
    <FlowText class="author" :text="song.author" v-if="showAuthor"></FlowText>
    <SongItemAddons
      :config="{
        trashUp: {
          need: restorable,
          func: () => putIntoList([song], 'allSongs'),
        },
        del: {
          need: delAble,
          func: () => {
            if (del) del(song);
          },
        },
        plus: { need: true, func: () => callModifyDialog([song]) },
        heart: {
          need: true,
          style: {
            color: isLiked ? 'red' : '',
            display: isLiked ? 'inline-block' : '',
          },
          func: () =>
            isLiked
              ? delFromList([song], 'liked')
              : putIntoList([song], 'liked'),
        },
      }"
    />
    <FlowText class="cnt" :text="fixedInt(song.cnt)" v-if="showCnt"></FlowText>
  </div>
</template>

<script>
import FlowText from "./FlowText.vue";
import SongItemAddons from "./SongItemAddons.vue";
import { mapActions, mapState } from "pinia";
import usePlayingQStore from "../store/playingQ";
import useSongListsStore from "../store/songLists";
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
    restorable: {
      // 显示上只有回收站列表里需要提供还原选项，也就不自行计算了。
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useSongListsStore, ["targetList"]),
    isLiked() {
      return this.targetList("liked").get(this.song.file_id);
    },
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play"]),
    ...mapActions(useSongListsStore, [
      "putIntoList",
      "delFromList",
      "callModifyDialog",
    ]),
  },
  beforeUnmount() {
    console.log("bye songItem");
  },
  components: {
    FlowText,
    SongItemAddons,
  },
};
</script>

<style scoped>
.song-item {
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
  width: 2em;
  text-align: center;
  color: var(--netease-number-color);
}
.song-item :deep(.addons) {
  display: none;
}
.song-item:hover :deep(.addons) {
  display: inline-block;
}
</style>