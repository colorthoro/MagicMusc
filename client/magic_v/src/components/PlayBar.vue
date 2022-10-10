<template>
  <div>
    <div class="container"></div>
  </div>
</template>

<script>
import { mapWritableState, mapActions } from "pinia";
import usePlayingQStore from "../store/playingQ";

export default {
  name: "PlayBar",
  data: () => ({}),
  computed: {
    ...mapWritableState(usePlayingQStore, [
      "playingQ",
      "history",
      "addSongMode",
      "playOrder",
      "historyMax",
      "playing",
    ]),
  },
  methods: {
    ...mapActions(usePlayingQStore, ["add", "play"]),
  },
};
</script>

<style>
</style>