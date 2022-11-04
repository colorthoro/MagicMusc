<template>
  <li
    v-for="(name, index) of iconName"
    :key="name + index"
    style="font-size: 0"
  >
    <font-awesome-icon
      class="addons red-hover"
      style="font-size: 1rem"
      v-if="completeConfig[name].need"
      :icon="fontAwesomeName[index]"
      :class="completeConfig[name].class"
      :style="completeConfig[name].style"
      @click.stop="if (completeConfig[name].func) completeConfig[name].func();"
    />
  </li>
</template>

<script>
export default {
  data() {
    return {
      defaultConfig: {
        need: false,
        class: null,
        style: null,
        func: null,
      },
      iconName: ["trashUp", "del", "plus", "heart", "cloudDown"],
      fontAwesomeName: [
        "fa-solid fa-trash-arrow-up",
        "fa-solid fa-xmark",
        "fa-solid fa-plus",
        "fa-regular fa-heart",
        "fa-solid fa-cloud-arrow-down",
      ],
    };
  },
  props: {
    config: {
      type: Object,
      //[icon-tab]{
      //    need: true,
      //    class: null,
      //    style: null,
      //    func: null,
      //}
    },
  },
  computed: {
    completeConfig() {
      let obj = {};
      this.iconName.forEach((attr) => {
        obj[attr] = { ...this.defaultConfig, ...this.config[attr] };
      });
      return obj;
    },
  },
  methods: {},
};
</script>

<style>
</style>