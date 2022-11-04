<template>
  <div class="item vlist-head-container">
    <div v-if="showIndex" class="item-index">#</div>
    <div class="pretty p-icon p-round p-pulse">
      <input type="checkbox" v-model="checked" />
      <div class="state p-primary">
        <font-awesome-icon class="icon" icon="fa-solid fa-check" />
        <label></label>
      </div>
    </div>
    <div class="options">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showIndex: {
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
    checked: {
      get() {
        console.log("vlisthead get checkStatus", this.checkStatus);
        return this.checkStatus === "allChecked";
      },
      set(val) {
        console.log(
          "vlisthead emit checkStatus",
          val ? "allChecked" : "noChecked"
        );
        this.$emit("update:checkStatus", val ? "allChecked" : "noChecked");
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
  .options {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
}
</style>