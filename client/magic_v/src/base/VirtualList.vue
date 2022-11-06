<template>
  <el-scrollbar ref="scroller" @scroll="scrollHandler">
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
          :key="item[id_field]"
          :style="{ height: itemHeight + 'px' }"
        >
          <div v-if="showIndex" class="item-index">
            {{ fixedInt(startIndex + index + 1) }}
          </div>
          <div v-if="needCheck" class="pretty p-icon p-round p-pulse">
            <input type="checkbox" :value="item" v-model="checkedList" />
            <div class="state p-primary">
              <font-awesome-icon class="icon" icon="fa-solid fa-check" />
              <label></label>
            </div>
          </div>
          <div class="item-content">
            <slot :item="item"></slot>
          </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
import { smoothCloser, sleep } from "../tools/others";
export default {
  data() {
    return {
      startIndex: 0, // index of the first showing item
      listTranslateY: 0,
      checkedList: new Set(),
    };
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    id_field: {
      type: String,
      default: "id",
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
    needCheck: {
      type: Boolean,
      default: true,
    },
    checkStatus: {
      type: String,
      default: "origin",
    },
  },
  emits: ["update:checkStatus"],
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
    popCheckedItems() {
      let res = Array.from(this.checkedList);
      this.checkedList.clear();
      return res;
    },
    async scrollTo(item) {
      let i = this.list.indexOf(item);
      if (i !== -1) {
        let closer = smoothCloser(
          this.startIndex * this.itemHeight,
          i * this.itemHeight,
          10,
          20
        );
        let step = closer.next();
        while (!step.done) {
          this.$refs.scroller.setScrollTop(step.value);
          step = closer.next();
          await sleep(10);
        }
      } else console.log("item not found in this vlist", item);
    },
  },
  watch: {
    checkStatus: {
      immediate: true,
      handler(newV) {
        console.log("vlist get checkStatus", newV);
        if (newV === "allChecked") {
          this.checkedList = new Set(this.list);
          // FIXME: given vmodel checkedList on the checkbox above and if here is checkedList.add(this.list[i])
          // then in the checkedList(Set) would exist two similar objs, one of them is the Proxy of another.
        } else if (newV === "noChecked") {
          this.checkedList.clear();
        }
      },
    },
    "checkedList.size": {
      handler(size) {
        let msg = "origin";
        if (size === 0) msg = "noChecked";
        else if (size === this.list.length) msg = "allChecked";
        console.log("vlist emit", msg);
        this.$emit("update:checkStatus", msg);
      },
    },
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