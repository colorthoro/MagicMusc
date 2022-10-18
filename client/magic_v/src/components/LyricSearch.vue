<template>
  <button @click="queryLyric">点击获取歌词</button>
</template>

<script>
import { Song } from "../tools/songsCache";
import { apiSuggestSongsInfo, apiGetLyric } from "../tools/api";
import { splitSongName } from "../tools/others";
export default {
  data() {
    return {
      keys: [],
      resultSongs: [],
      bestIndex: -1,
    };
  },
  props: {
    song: {
      type: Song,
      required: true,
    },
  },
  computed: {
    bestMatch() {
      if (!this.resultSongs.length) return null;
      return this.resultSongs[Math.max(this.bestIndex, 0)];
    },
  },
  methods: {
    findBestMatch(partlyResults, partlyKeys) {
      for (let j = 0; j < partlyResults.length; j++) {
        let song = partlyResults[j];
        for (let k = 0; k < song.artists.length; k++) {
          let author = song.artists[k].name;
          if (partlyKeys.indexOf(author) !== -1) {
            console.log("猜测最佳匹配：", song, author);
            this.bestIndex = j;
            return;
          } else console.log(song, author);
        }
      }
    },
    async findAllResultSongs() {
      for (let i = -1; i < this.keys.length; i++) {
        console.log(`选取文件名中的第${i}个关键词作为歌名搜索中...`);
        let key = i === -1 ? this.keys.join("+") : this.keys[i];
        let res = (await apiSuggestSongsInfo(key)).data;
        if (res.code !== 200 || !res.result.songs) continue;
        console.log(res.result.songs);
        this.resultSongs = this.resultSongs.concat(res.result.songs);
        this.findBestMatch(
          res.result.songs,
          this.keys.slice(0, i).concat(this.keys.slice(i + 1, this.keys.length))
        );
        console.log("ok");
        await new Promise((ok) => setTimeout(ok, 500));
      }
    },
    async queryLyric() {
      this.keys = splitSongName(this.song.name);
      await this.findAllResultSongs();
      if (this.bestMatch) {
        console.log("最终匹配：", this.bestMatch);
        let lrc = (await apiGetLyric(this.bestMatch.id)).data.lrc.lyric;
        console.log("得到歌词：", lrc);
        this.song.fillLrc(lrc);
      }
    },
  },
};
</script>

<style>
</style>