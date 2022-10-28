<template>
  <div
    class="outer"
    ref="outer"
    @mouseenter.once="setSpeed()"
    @mouseover="go = true"
    @mouseleave="go = false"
  >
    <div :class="{ inner: 1, flow: need && go }" ref="inner" :content="text">
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      need: true,
      go: false,
    };
  },
  props: {
    text: {
      type: [String, Number],
      default: "可能很长长长长的文本",
    },
  },
  methods: {
    setSpeed() {
      let ow = this.$refs.outer.offsetWidth,
        inner = this.$refs.inner,
        iw = inner.childNodes[0].offsetWidth;
      inner.style.animationDuration =
        iw > ow
          ? (inner.offsetWidth / 80).toFixed(2) + "s"
          : (this.need = false);
    },
  },
};
</script>

<style lang="scss" scoped>
.outer {
  overflow: hidden;
  white-space: nowrap;
}
.inner {
  display: inline-block; /* 否则末尾总有一个margin去不掉 */
  position: relative;
  width: 100%;
  span {
    display: inline-block; // 否则无法设定宽度
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.flow::after {
  content: attr(content);
  position: absolute;
  left: 100%;
}
.flow {
  width: fit-content;
  padding-right: 50%;
  animation: scroll-x linear infinite;
}
@keyframes scroll-x {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>