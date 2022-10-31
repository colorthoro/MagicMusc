<template>
  <el-scrollbar @scroll="scrollHandler">
    <div
      class="total-height-supporter"
      style="position: relative"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        class="list"
        style="position: absolute; top: 0; width: 100%"
        v-if="listShowing.length"
        :style="{ transform: `translateY(${listTranslateY})` }"
      >
        <div
          class="item"
          style="display: flex; flex-direction: column; justify-content: center"
          v-for="item of listShowing"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item.data"></slot>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
export default {
  data() {
    return {
      startIndex: 0, // index of the first showing item
      listTranslateY: 0,
    };
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    height: {
      type: Number,
      default: 200,
    },
    itemHeight: {
      type: Number,
      default: 60,
    },
  },
  computed: {
    totalHeight() {
      return this.itemHeight * this.list.length;
    },
    itemCnt() {
      return Math.ceil(this.height / this.itemHeight);
    },
    listShowing() {
      return this.list.slice(
        this.startIndex,
        this.startIndex + this.itemCnt + 1
      );
    },
  },
  methods: {
    scrollHandler({ scrollTop }) {
      console.log(scrollTop);
      this.startIndex = Math.floor(scrollTop / this.itemHeight);
      let yu = scrollTop - this.startIndex * this.itemHeight;
      this.listTranslateY = scrollTop - yu + "px";
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  border-bottom: 1px solid rgb(228, 231, 237);
}
</style>