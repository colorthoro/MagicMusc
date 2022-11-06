<template>
  <div class="progress-wrapper">
    <div class="progress-bar-wrapper">
      <div
        class="progress-bar"
        ref="progressBar"
        @mouseenter="onBar = true"
        @mouseleave="onBar = false"
        @click="this.setX($event.clientX)"
      >
        <div class="bar-inner">
          <div class="progress" ref="progress">
            <div
              class="progress-btn"
              v-show="!disabled && showProgressBtn"
              @mousedown="dragSet($event)"
              @touchstart="dragSet($event)"
              @touchmove="dragSet($event)"
              @touchend="dragSet($event)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      remainPlayState: undefined,
      onBar: false,
      dragEffect: false,
      timeOut: null,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: 1,
      isValid(v) {
        return v > 0;
      },
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    beforeDrag: {
      type: Function,
      defalut: null,
    },
    onDrag: {
      type: Function,
      defalut: null,
    },
    afterDrag: {
      type: Function,
      defalut: null,
    },
  },
  computed: {
    cursor() {
      return this.disabled ? "default" : "pointer";
    },
    percent: {
      get() {
        return this.modelValue / this.max;
      },
      set(val) {
        let update = val * this.max;
        if (update !== this.modelValue) this.$emit("update:modelValue", update);
      },
    },
    showProgressBtn() {
      return this.isMobile() || this.onBar || this.dragEffect;
    },
  },
  methods: {
    setX(x) {
      if (this.disabled) return;
      let rect = this.$refs.progressBar.getBoundingClientRect();
      this.percent = Math.min(1, Math.max(0, (x - rect.x) / rect.width));
    },
    dragSet(e) {
      if (this.disabled) return;
      e.preventDefault();
      if (e.type === "touchstart" || e.type === "mousedown") {
        if (this.beforeDrag) this.remainPlayState = this.beforeDrag();
      } else if (e.type === "touchend") {
        if (this.afterDrag) this.afterDrag(this.remainPlayState);
      } else if (e.type === "touchmove") {
        if (this.onDrag) this.onDrag();
        this.setX(e.touches[0].clientX);
      }
      if (e instanceof MouseEvent) {
        let mousemove = document.onmousemove,
          mouseup = document.onmouseup;
        this.dragEffect = true;
        if (this.timeOut) clearTimeout(this.timeOut);
        document.onmousemove = (me) => {
          me.preventDefault();
          if (this.onDrag) this.onDrag();
          this.setX(me.clientX);
        };
        document.onmouseup = (ue) => {
          ue.preventDefault;
          if (this.afterDrag) this.afterDrag(this.remainPlayState);
          document.onmousemove = mousemove;
          document.onmouseup = mouseup;
          this.timeOut = setTimeout(() => {
            this.dragEffect = false;
            this.timeOut = null;
            console.log("dragEffect off");
          }, 3000);
        };
      }
    },
  },
  watch: {
    percent() {
      this.$refs.progress.style.width = this.percent * 100 + "%";
    },
  },
  beforeUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  },
};
</script>

<style lang="scss" scoped>
.progress-wrapper {
  width: 100%;
  align-items: center;
  .progress-bar-wrapper {
    .progress-bar {
      height: 15px;
      cursor: v-bind(cursor);
      .bar-inner {
        position: relative;
        top: 50%;
        height: 2px;
        transform: translate(0, -50%);
        background: rgba(0, 0, 0, 0.05);
        .progress {
          position: absolute;
          height: 100%;
          background-color: red;
          .progress-btn {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translate(50%, -50%);
            box-sizing: border-box;
            width: 16px;
            height: 16px;
            border: 3px solid white;
            border-radius: 50%;
            background: red;
          }
        }
      }
    }
  }
}
</style>