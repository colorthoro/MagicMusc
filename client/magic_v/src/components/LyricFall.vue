<template>
  <div>
    <div>
      <button @click="offsetTime -= 0.5">放慢0.5s</button>
      <span>{{ offsetTime }}</span>
      <button @click="offsetTime += 0.5">加快0.5s</button>
    </div>
    <div class="scroller" ref="scroller">
      <div class="plate">
        <div
          @mouseenter="playing = false"
          @mouseleave="playing = true"
          v-for="(row, index) of lrcRows.rows"
          :class="rowClass(index)"
          @click="(nowIndex = index), (playing = true)"
          :key="index"
        >
          {{ row }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import usePlayingQStore from "../store/playingQ";

export default {
  name: "LyricFall",
  data() {
    return { playing: true, offsetTime: 0 };
  },
  computed: {
    ...mapState(usePlayingQStore, ["recent", "accurateTime", "audio"]),
    lrcRows() {
      if (!this.recent || !this.recent.lyric.length)
        return { rows: [], timePoint: [] };
      let lrc = this.recent.lyric;
      let it = lrc.matchAll(
        /(\[(?<min>\d+):(?<sec>\d+(\.\d+){0,1})\])(?<content>.*)\n/g
      );
      let current = it.next();
      let rows = [];
      let timePoint = [];
      while (!current.done) {
        let groups = current.value.groups;
        rows.push(groups.content.trim());
        timePoint.push(Number(groups.min) * 60 + Number(groups.sec));
        current = it.next();
      }
      return { rows, timePoint };
    },
    nowIndex: {
      get() {
        let i = 0;
        for (; i < this.lrcRows.timePoint.length; i++) {
          let t = this.lrcRows.timePoint[i] - this.offsetTime;
          if (t > this.accurateTime) return i ? i - 1 : 0;
        }
        return i === this.lrcRows.timePoint.length ? i - 1 : -1;
      },
      set(index) {
        if (index < 0 || index >= this.lrcRows.timePoint.length) return;
        if (this.audio)
          this.audio.currentTime =
            this.lrcRows.timePoint[index] - this.offsetTime;
      },
    },
  },
  methods: {
    rowClass(index) {
      return ["row", index == this.nowIndex ? "now" : ""];
    },
  },
  watch: {
    nowIndex() {
      this.$nextTick(() => {
        let now = document.querySelector(".now"); // index 更新时 .now 还没更新，放在 nextTick 中才不会获取到旧的now。
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