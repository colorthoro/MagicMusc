<template>
  <div>
    <div>
      <button @click="offsetTime -= 0.5">放慢0.5s</button>
      <button @click="offsetTime += 0.5">加快0.5s</button>
      <span>{{ offsetTime }}</span>
      <button @click="resetLrc()">重置歌词</button>
      <input type="text" v-model="fillLrc" @change="resetLrc(fillLrc)" />
    </div>
    <div class="scroller" ref="scroller">
      <div class="plate">
        <div
          @mouseenter="playing = false"
          @mouseleave="playing = true"
          @touchstart="playing = false"
          @touchend="playing = true"
          v-for="(row, index) of lrcRows.rows"
          :class="rowClass(index)"
          @click="setIndex(index), (playing = true)"
          :key="index"
        >
          {{ row }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import useLyricStore from "../store/lyric";

export default {
  name: "LyricFall",
  data() {
    return { playing: true, fillLrc: "" };
  },
  computed: {
    ...mapState(useLyricStore, ["lrcRows", "nowIndex", "nowSentence"]),
    ...mapWritableState(useLyricStore, ["offsetTime"]),
  },
  methods: {
    ...mapActions(useLyricStore, ["setIndex", "resetLrc"]),
    rowClass(index) {
      return ["row", index == this.nowIndex ? "now" : ""];
    },
  },
  watch: {
    nowIndex() {
      this.$nextTick(() => {
        let now = document.querySelector(".now"); // index 更新时 .now 还没更新，放在 nextTick 中才不会获取到旧的 now。
        if (!now || !this.playing) return;
        // now.scrollIntoView({ behavior: "smooth", block: "center" });  // 不要用 scrollIntoView，因为它会把整个页面都移动。
        this.$refs.scroller.scrollTo({
          left: 0,
          top:
            now.offsetTop -
            this.$refs.scroller.clientHeight / 2 +
            now.clientHeight / 2,
          behavior: "smooth",
        });
      });
    },
  },
};
</script>

<style scoped>
.scroller {
  background: linear-gradient(skyblue, white, skyblue);
  box-sizing: border-box;
  height: 10rem;
  /* width: max-content; */
  overflow: auto;
  padding: 5% 5em;
  font-family: "楷体";
  position: relative;
}

.scroller::-webkit-scrollbar {
  display: none;
}

.plate {
  margin: 50% 0;
}

.row {
  width: fit-content;
  margin: 0 auto;
  line-height: 2em;
  text-align: center;
  opacity: 0.5;
}

.now {
  font-size: 2em;
  opacity: 1;
}

.search {
  position: absolute;
  top: 0;
  left: 0;
  width: 8em;
}
</style>