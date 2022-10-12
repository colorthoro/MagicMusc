import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";

export default defineStore('playingQ', {
    state: () => ({
        playingQ: [],
        nowIndex: 0,
        history: { max: 100, normal: [], recur: [] },
        playOrder: 'random' || 'one' || 'queue',
        audio: null,
    }),
    getters: {
        nowToPlay(state) {
            if (!state.playingQ.length) {
                console.log('播放列表为空！');
                return null;
            }
            return state.playingQ[this.nowIndex];
        },
        recent(state) {
            if (!state.history.normal.length) return;
            return state.history.normal.slice(-1);
        },
        historyList(state) {
            return state.history.normal.slice(0, -1)
                .concat(state.history.recur, this.recent);
        }
    },
    actions: {
        addToPlaying(songOrSongs, addSongMode = 'rightNow') {
            if (songOrSongs instanceof Array) {
                this.nowIndex = 0;
                let pure = songOrSongs.filter(v => v instanceof Song);
                this.playingQ = pure;
            }
            else if (songOrSongs instanceof Song) {
                if (addSongMode === 'rightNow') {
                    this.interruptIN(songOrSongs);
                } else if (addSongMode === 'queue') {
                    this.playingQ.splice(this.playingQ.findIndex(song => songOrSongs === song), 1);
                    this.playingQ.push(songOrSongs);
                }
            }
        },
        interruptIN(song) {
            if (song === this.playingQ[this.nowIndex]) return;
            let i = this.playingQ.indexOf(song);
            if (i === -1) {
                this.playingQ.splice(this.nowIndex, 0, song);
                return;
            }
            this.nowIndex = i;
        },
        recordPlayed(song) {
            if (!(song instanceof Song)) return;
            if (this.recent && song === this.recent.song) {
                this.recent.cnt++;
                return;
            }
            let i = this.history.normal.findIndex(hi => hi.song === song);
            if (i !== -1) {
                let target = this.history.normal.splice(i, 1)[0];
                target.cnt++;
                this.history.normal.push(target);
                return;
            }
            this.history.normal.push({ song, cnt: 1 });
        },
        pause() {
            this.audio.pause();
        },
        next() {
            if (!this.playingQ.length) return;
            if (this.history.recur.length) {
                this.history.normal.push(this.history.recur.pop());
                this.interruptIN(this.recent.song);
                this.play();
                return;
            }
            if (this.playOrder === 'queue') {
                this.nowIndex++;
                this.nowIndex %= this.playingQ.length;
            }
            else if (this.playOrder === 'random') {
                let limit = 3;
                do {
                    this.nowIndex = Math.floor(Math.random() * this.playingQ.length);
                } while (
                    this.nowToPlay === this.recent.song || (
                        limit-- && this.historyList.find(hi => hi.song === this.nowToPlay)
                    )
                );
            }
            this.play();
        },
        last() {
            if (!this.history.normal.length || !this.playingQ.length) return;
            if (this.history.normal.length === 1) {
                this.play();
                return;
            }
            this.history.recur.push(this.history.normal.pop());
            this.interruptIN(this.recent.song);
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
            let targetSong = this.nowToPlay;
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