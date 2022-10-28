<template>
  <div class="btn" ref="btn" v-if="showBtn" @click="showBtn = false">
    {{ text }}
  </div>
  <input
    type="text"
    class="tag"
    v-else
    v-model="value"
    ref="input"
    @keydown.enter="ok"
    @blur="ok"
  />
</template>

<script>
export default {
  data() {
    return {
      showBtn: true,
      value: "",
    };
  },
  props: {
    text: {
      type: String,
      default: "+",
    },
    validator: {
      type: Function,
      default: (val) => val.length,
    },
  },
  emits: ["res"],
  watch: {
    showBtn(newV) {
      this.$nextTick(() => {
        if (!newV) this.$refs.input.focus();
      });
    },
  },
  methods: {
    click() {
      if (this.showBtn) this.$refs.btn.click();
      else this.$refs.input.click();
    },
    ok() {
      if (!this.validator || this.validator(this.value)) {
        this.$emit("res", this.value);
        this.value = "";
      }
      this.showBtn = true;
    },
  },
};
</script>

<style scoped>
.btn {
  display: inline-block;
}
</style>