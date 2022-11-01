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
          v-for="(item, index) of listShowing"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          <div v-if="showIndex" class="item-index">
            {{ fixedInt(startIndex + index + 1) }}
          </div>
          <div class="item-content">
            <slot :item="item.data"></slot>
          </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
import { fixedInt } from "../tools/others";
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
    showIndex: {
      type: Boolean,
      default: true,
    },
    showStripe: {
      type: Boolean,
      default: false,
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
      this.startIndex = Math.floor(scrollTop / this.itemHeight);
      let yu = scrollTop - this.startIndex * this.itemHeight;
      this.listTranslateY = scrollTop - yu + "px";
    },
    fixedInt,
  },
};
</script>

<style lang="scss" scoped>
.item {
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  .item-index {
    flex: 0 0 2em;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--netease-number-color);
  }
  .item-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
.item:nth-child(2n + 1) {
  background-color: v-bind(
    'showStripe ? "var(--netease-background-color-dark)": ""'
  );
}
</style>