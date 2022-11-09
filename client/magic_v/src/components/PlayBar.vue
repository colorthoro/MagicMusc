<template>
  <div class="container">
    <div class="song">
      <div class="song-pic">
        <img :src="picUrlReciver.url" />
      </div>
      {{ nowSentence }}
    </div>
    <div class="controlls">
      <font-awesome-icon
        @click="last"
        icon="fa-solid fa-backward-step"
      ></font-awesome-icon>
      <div style="position: relative">
        <font-awesome-icon
          @click="onOff"
          v-if="!this.audio || this.audio.paused"
          icon="fa-solid fa-circle-play"
          :style="{ color: fetching ? '#cfa3a3' : 'red' }"
          style="background-color: white; border-radius: 50%"
        />
        <font-awesome-icon
          @click="onOff"
          v-else
          icon="fa-solid fa-circle-pause"
          :style="{ color: fetching ? '#cfa3a3' : 'red' }"
          style="background-color: white; border-radius: 50%"
        />
        <loading-acc
          v-if="fetching"
          stroke="red"
          style="
            display: block;
            height: 40px;
            width: 40px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "
        ></loading-acc>
      </div>
      <font-awesome-icon
        @click="next"
        icon="fa-solid fa-forward-step"
      ></font-awesome-icon>
    </div>
    <div class="mode">
      <span class="time">
        {{ formalTime(currentTime) }}|{{ formalTime(duration) }}
      </span>
      <div class="volume">
        <div class="icon" @click="if (audio) audio.muted = !audio.muted;">
          <font-awesome-icon
            icon="fa-solid fa-volume-xmark"
            v-if="audio?.muted"
          />
          <font-awesome-icon
            icon="fa-solid fa-volume-high"
            v-else-if="volumeControll > 50"
          />
          <font-awesome-icon
            icon="fa-solid fa-volume-low"
            v-else-if="volumeControll > 0"
          />
          <font-awesome-icon
            icon="fa-solid fa-volume-off"
            v-else-if="volumeControll === 0"
          />
        </div>
        <div class="volume-percent">
          <ProgressSlider
            :disabled="!audio"
            :max="100"
            v-model="volumeControll"
          ></ProgressSlider>
        </div>
      </div>
      <div class="order" @click="nowOrder++">
        <font-awesome-layers>
          <font-awesome-icon
            v-if="playOrder === 'random'"
            icon="fa-solid fa-shuffle"
          />
          <font-awesome-icon v-else icon="fa-solid fa-repeat" />
          <font-awesome-icon
            v-if="playOrder === 'one'"
            icon="fa-solid fa-1"
            transform="shrink-10"
          />
        </font-awesome-layers>
      </div>
      <el-popover
        placement="top"
        width="50vw"
        trigger="click"
        :hide-after="0"
        transition="el-zoom-in-bottom"
        :persistent="false"
        @before-enter="mountList"
        @hide="unmountList"
      >
        <template #reference>
          <div>
            <font-awesome-icon icon="fa-solid fa-bars"> </font-awesome-icon>
          </div>
        </template>
        <PlayList style="height: 65vh" v-if="callPlayList" />
      </el-popover>
    </div>
    <!-- 进度条 -->
    <ProgressSlider
      style="position: absolute; top: 0; transform: translate(0, -50%)"
      :disabled="!audio || !!fetching"
      :max="duration - 1"
      :beforeDrag="() => !audio.paused"
      :onDrag="() => onOff(0, false)"
      :afterDrag="(remain) => onOff(0, remain)"
      v-model="currentTimeControll"
    ></ProgressSlider>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapState, mapWritableState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";
import useLyricStore from "../store/lyric";
import usePicsStore from "../store/pics";
import ProgressSlider from "../base/ProgressSlider.vue";
const PlayList = defineAsyncComponent(() => import("./PlayList.vue"));

export default {
  name: "PlayBar",
  components: {
    PlayList,
    ProgressSlider,
  },
  props: {
    height: {
      type: String,
      default: "3rem",
    },
  },
  data() {
    return {
      timeout: null,
      callPlayList: false,
      picUrlReciver: { id: 0, url: null },
    };
  },
  computed: {
    ...mapWritableState(usePlayingQStore, ["nowOrder"]),
    ...mapState(usePlayingQStore, [
      "playOrder",
      "audio",
      "currentTime",
      "duration",
      "volume",
      "fetching",
      "recent",
    ]),
    ...mapState(useLyricStore, ["nowSentence"]),
    volumeControll: {
      get() {
        return parseInt(this.volume * 100);
      },
      set(val) {
        if (this.audio) this.audio.volume = val / 100;
      },
    },
    currentTimeControll: {
      get() {
        return this.currentTime;
      },
      set(val) {
        if (this.audio) this.audio.currentTime = val;
      },
    },
  },
  methods: {
    ...mapActions(usePlayingQStore, ["onOff", "next", "last"]),
    ...mapActions(usePicsStore, ["getPicUrl", "losePicUrl"]),
    unmountList() {
      this.timeout = setTimeout(() => (this.callPlayList = false), 3000);
    },
    mountList() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.callPlayList = true;
    },
  },
  watch: {
    recent: {
      immediate: true,
      handler() {
        this.losePicUrl(this.picUrlReciver.url);
        this.getPicUrl(this.recent, this.picUrlReciver);
      },
    },
  },
  beforeUnmount() {
    delete this.picUrlReciver.id;
    clearTimeout(this.timeout);
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: fixed;
  display: flex;
  justify-content: space-between;
  bottom: 0;
  width: 100%;
  /* height: 3rem; */
  z-index: 99;
}
.song {
  display: flex;
  color: gray;
  align-items: center;
  padding-left: 1rem;
  width: 40%;
  overflow: hidden;
  .song-pic {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 10px;
    margin-right: 20px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      &:hover {
        filter: blur(5px);
      }
    }
  }
}
.controlls {
  display: flex;
}
.mode {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  width: 40%;
}
.mode * + * {
  margin-left: 10px;
}
.time {
  margin-right: 1rem;
  color: var(--netease-number-color);
  user-select: none;
}
@media (max-width: 35em) {
  .song,
  .mode {
    display: none;
  }
  .container {
    justify-content: center;
  }
}
.fa-circle-play,
.fa-circle-pause {
  display: block;
  color: red;
  height: 40px;
  margin: 10px 30px;
  cursor: pointer;
}
.fa-backward-step,
.fa-forward-step {
  display: block;
  color: red;
  height: 20px;
  margin: auto;
  cursor: pointer;
}
.volume {
  width: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .icon {
    width: 15px;
    cursor: pointer;
  }
  .volume-percent {
    width: 80%;
    flex-grow: 1;
  }
}
</style>