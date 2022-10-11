import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";

export default defineStore('playingQ', {
    state: () => ({
        playingQ: [],
        nowIndex: 0,
        history: { recall: -1, max: 100, list: [] },
        addSongMode: 'rightNow' || 'queue',
        playOrder: 'random' || 'one' || 'queue',
        audio: null,
    }),
    getters: {
        now(state) {
            if (state.playingQ.length === 0) {
                console.log('播放列表为空！');
                return null;
            }
            return state.playingQ[this.nowIndex];
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
                if (this.addSongMode === 'rightNow') {
                    this.playingQ.splice(this.nowIndex, 0, songOrSongs);
                } else if (this.addSongMode === 'queue') {
                    this.playingQ.push(songOrSongs);
                }
            }
        },
        recordPlayed(song) {
            let i = -1, cnt = 1;
            this.history.list.forEach((hi, index) => {
                if (hi.song === song) {
                    cnt += hi.cnt;
                    i = index;
                }
            });
            i !== -1 && this.history.list.splice(i, 1);
            this.history.list.push({ song, cnt });
            if (this.history.list.length > this.history.max) {
                this.history.list.shift();
            }
        },
        pause() {
            this.audio.pause();
        },
        next() {
            if (this.playOrder === 'queue') {
                this.nowIndex++;
                this.nowIndex %= this.playingQ.length;
            }
            else if (this.playOrder === 'random') {
                this.nowIndex = Math.floor(Math.random() * this.playingQ.length);
            }
            this.history.recall = -1;
            this.play();
        },
        last() {
            if (!this.history.list.length) return;
            if (this.history.recall === -1) {
                this.history.recall = Math.max(this.history.list.length - 2, 0);
            }
            let lastSong = this.history.list[this.history.recall].song;
            this.history.recall--;
            let i = this.playingQ.indexOf(lastSong);
            if (i === -1) {
                this.playingQ.splice(this.nowIndex, 0, lastSong);
            } else this.nowIndex = i;
            this.play();
        },
        async play(songOrSongs) {
            if (!this.audio) {
                var audio = new Audio();
                this.audio = audio;
            } else if (this.audio.src && !this.audio.paused) {
                this.audio.pause();
                URL.revokeObjectURL(this.audio.src);
            }
            songOrSongs && this.addToPlaying(songOrSongs);
            let targetSong = this.now;
            if (!targetSong) {
                console.log('请先选择歌曲吧！');
                return;
            }
            console.log('准备获取', targetSong);
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