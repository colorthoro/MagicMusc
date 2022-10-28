<template>
  <div class="item" @click.stop="playAble && play(song)">
    <FlowText class="name" :text="song.name"></FlowText>
    <FlowText class="author" :text="song.author" v-if="showAuthor"></FlowText>
    <FlowText class="cnt" :text="song.cnt" v-if="showCnt"></FlowText>
    <div v-if="delAble" class="del" @click.stop="if (del) del(song);">删除</div>
  </div>
</template>

<script>
import FlowText from "./FlowText.vue";
import { mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";
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
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play"]),
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
.cnt,
.del {
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
.del {
  display: none;
}
.item:hover .del {
  display: block;
}
</style>