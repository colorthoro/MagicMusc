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
            @mouseenter="showProgressBtn = this.audio ? true : false"
            @mouseleave="showProgressBtn = false"
            @click="setPercent($event.clientX)"
          >
            <div class="bar-inner">
              <div class="progress" ref="progress">
                <div
                  class="progress-btn"
                  ref="progressBtn"
                  v-show="showProgressBtn"
                  @mousedown="dragSet($event)"
                  @touchmove="dragSet($event)"
                  @touchend="dragSet($event)"
                ></div>
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
import { formalTime, isMobile } from "../tools/others";

export default {
  name: "PlayBar",
  data() {
    return { showProgressBtn: isMobile() };
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
        val = Math.min(1, Math.max(val, 0));
        if (this.audio) this.audio.currentTime = this.duration * val;
      },
    },
    cursor() {
      return this.audio ? "pointer" : "default";
    },
  },
  methods: {
    ...mapActions(usePlayingQStore, ["play", "del", "onOff", "next", "last"]),
    formalTime,
    setPercent(x) {
      if (!this.audio) return;
      let rect = this.$refs.progressBar.getBoundingClientRect();
      // 点击事件有可能被子元素触发，那时offsetX就是相对于子元素了，所以不能用。
      this.percent = (x - rect.x) / rect.width;
    },
    dragSet(e) {
      if (!this.audio) return;
      e.preventDefault();
      let playing;
      if (e.type === "touchstart" || e.type === "mousedown") {
        playing = !this.audio.paused;
      } else if (e.type === "touchend") {
        this.onOff(0, playing);
      } else if (e.type === "touchmove") {
        this.onOff(0, false);
        this.setPercent(e.touches[0].clientX);
      }
      if (!(e instanceof MouseEvent)) return;
      let mousemove = document.onmousemove,
        mouseup = document.onmouseup;
      document.onmousemove = (me) => {
        me.preventDefault();
        this.onOff(0, false);
        this.setPercent(me.clientX);
      };
      document.onmouseup = (ue) => {
        ue.preventDefault;
        this.onOff(0, playing);
        document.onmousemove = mousemove;
        document.onmouseup = mouseup;
      };
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
      cursor: v-bind(cursor);
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