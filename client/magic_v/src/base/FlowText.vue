<template>
  <div class="outer" @mouseenter.once="setSpeed()">
    <div class="inner" ref="inner" :content="text">
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: [String, Number],
      default: "可能很长长长长的文本",
    },
  },
  methods: {
    setSpeed() {
      this.$refs.inner.style.animationDuration =
        (this.$refs.inner.offsetWidth / 80).toFixed(2) + "s";
    },
  },
};
</script>

<style scoped>
.outer {
  overflow: hidden;
  white-space: nowrap;
}
.inner {
  display: inline-block; /* 否则末尾总有一个margin去不掉 */
  position: relative;
  width: fit-content;
}
.outer:hover .inner::after {
  content: attr(content);
  position: absolute;
  left: 100%;
}
.outer:hover .inner {
  padding-right: 50%;
  animation: scroll-x 5s linear infinite;
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