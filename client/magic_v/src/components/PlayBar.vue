<template>
  <div>
    <div class="container">
      <button @click="last">上一首</button>
      <button @click="onOff">暂停/开始</button>
      <button @click="next">下一首</button>
      模式：<button @click="this.nowOrder++">{{ playOrder }}</button>
      播放列表：
      <div v-for="song of playingQ" :key="song.file_id">
        {{ song.name }} {{ song.sameWith(recent) ? "***" : "---" }}
        <button @click="del(song)">删除</button>
        <button @click="play(song)">播放</button>
      </div>
      历史列表：
      <div v-if="history.normal.length">
        <div v-for="hi of historyList" :key="hi.file_id">
          {{ hi.name }} --- {{ hi.cnt }}
          <button @click="play(hi)">播放</button>
        </div>
      </div>
      <!-- normal:
      <div v-for="hi of history.normal" :key="hi.file_id">
        {{ hi.name }}
      </div>
      recur:
      <div v-for="hi of history.recur" :key="hi.file_id">
        {{ hi.name }}
      </div> -->
      <!-- 进度条 -->
      <div class="progress-wrapper">
        <!-- 时间显示 -->
        <span class="time"
          >{{ formalTime(currentTime) }}|{{ formalTime(duration) }}</span
        >
        <div class="progress-bar-wrapper">
          <div
            class="progress-bar"
            ref="progressBar"
            @click.capture="progressClick"
          >
            <div class="bar-inner">
              <div class="progress" ref="progress">
                <div class="progress-btn"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapWritableState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";
import { formalTime } from "../tools/time";

export default {
  name: "PlayBar",
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(usePlayingQStore, ["nowOrder"]),
    ...mapState(usePlayingQStore, [
      "playOrder",
      "playingQ",
      "history",
      "historyList",
      "recent",
      "audio",
      "currentTime",
      "duration",
    ]),
    percent: {
      get() {
        return (this.duration ? this.currentTime / this.duration : 0) * 100;
      },
      set(val) {
        if (this.audio) this.audio.currentTime = this.duration * val;
      },
    },
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play", "del", "onOff", "next", "last"]),
    formalTime,
    progressClick(e) {
      let rect = e.currentTarget.getBoundingClientRect();
      // 点击事件有可能被子元素触发，那时offsetX就是相对于子元素了，所以不能用。
      this.percent = Math.max(0, e.clientX - rect.x) / rect.width;
    },
  },
  watch: {
    percent() {
      this.$refs.progress.style.width = this.percent + "%";
    },
  },
};
</script>

<style lang="scss">
.progress-wrapper {
  display: flex;
  align-items: center;
  width: 95%;
  margin: 0px auto;
  padding: 10px 0;
  .progress-bar-wrapper {
    flex: 1;
    margin: 0 10px;
    .progress-bar {
      height: 30px;
      cursor: pointer;
      .bar-inner {
        position: relative;
        top: 50%;
        height: 4px;
        z-index: 1;
        transform: translate(0, -50%);
        background: rgba(238, 229, 255, 1);
        .progress {
          position: absolute;
          height: 100%;
          background-color: #bc99ff;
          .progress-btn {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translate(50%, -50%);
            box-sizing: border-box;
            width: 16px;
            height: 16px;
            border: 3px solid #fff;
            border-radius: 50%;
            background: #bc99ff;
          }
        }
      }
    }
  }
}
</style>