import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";

export default defineStore('playingQ', {
    state: () => ({
        playingQ: [],
        history: [],
        addSongMode: 'unshift' || 'push',
        playOrder: 'queue' || 'one' || 'random',
        historyMax: 100,
        audio: null,
    }),
    getters: {
        now(state) {
            if (state.playingQ.length === 0) {
                console.log('播放列表为空！');
                return null;
            }
            return state.playingQ[0];
        }
    },
    actions: {
        addToPlaying(songOrSongs) {
            if (songOrSongs instanceof Array) {
                let pure = songOrSongs.filter(v => v instanceof Song);
                this.playingQ = pure;
            }
            else if (songOrSongs instanceof Song) {
                let i = this.playingQ.indexOf(songOrSongs);
                if (i !== -1) this.playingQ.splice(i, 1);
                this.playingQ[this.addSongMode](songOrSongs);
            }
        },
        recordPlayed(song) {
            this.history.push({ song, t: Date() });
            if (this.history.length > this.historyMax) {
                this.history.shift();
            }
        },
        pause() {
            this.audio.pause();
        },
        async play(songOrSongs) {
            if (!this.audio) {
                var audio = new Audio();
                this.audio = audio;
            } else if (this.audio.src && !this.audio.paused) {
                this.audio.pause();
                URL.revokeObjectURL(this.audio.src);
            }
            this.addToPlaying(songOrSongs);
            let targetSong = this.now;
            if (!targetSong) {
                console.log('请先选择歌曲吧！');
                return;
            }
            console.log('准备获取', songOrSongs);
            let blob = await targetSong.fetch();
            console.log('即将开始播放', blob);
            this.recordPlayed(targetSong);
            let url = URL.createObjectURL(blob);
            this.audio.src = url;
            this.audio.controls = true;
            this.audio.play();
        },
    }
})