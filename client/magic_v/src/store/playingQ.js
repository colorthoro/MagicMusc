import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";

export default defineStore('playingQ', {
    state: () => ({
        playingQ: [],
        nowIndex: -1,
        history: { max: 100, normal: [], recur: [] },
        playOrder: 'random' || 'one' || 'queue',
        audio: null,
    }),
    getters: {
        nowToPlay(state) {
            if (!state.playingQ.length) {
                console.log('播放列表为空！');
                return;
            }
            return state.playingQ[this.nowIndex];
        },
        recent(state) {
            if (!state.history.normal.length) return;
            return state.history.normal.slice(-1)[0];
        },
        historyList(state) {  // 不要用它给playingQ赋值，由于对象的浅拷贝、代理，赋值会造成怪异的结果。
            return [].concat(
                state.history.normal.slice(0, -1),
                state.history.recur,
                this.history.normal.slice(-1)
            );
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
                    this._interruptIN(songOrSongs);
                } else if (addSongMode === 'queue') {
                    this.playingQ.splice(this.playingQ.indexOf(songOrSongs), 1);
                    this.playingQ.push(songOrSongs);
                }
            }
        },
        del(song) {
            if (!this.playingQ.length) return;
            let i = -1;
            if (song === this.playingQ[this.nowIndex]) {
                i = this.nowIndex;
            } else i = this.playingQ.indexOf(song);
            this.playingQ.splice(i, 1);
            if (i === this.nowIndex) {
                this.nowIndex = i === this.playingQ.length ? i - 1 : i;
                this._play();
            } else if (i < this.nowIndex) this.nowIndex--;
        },
        _interruptIN(song) {  // 内部函数，不要在外使用
            if (song === this.playingQ[this.nowIndex]) return;
            let i = this.playingQ.indexOf(song);
            if (i === -1) {
                this.nowIndex = Math.max(this.nowIndex, 0);
                this.playingQ.splice(this.nowIndex, 0, song);
                return;
            }
            this.nowIndex = i;
        },
        _recordPlayed(song) {  // 内部函数，不要在外使用
            if (!(song instanceof Song)) return;
            if (this.recent && song === this.recent.song) {
                this.recent.cnt++;
                return;
            }
            let i = this.history.normal.indexOf(song);
            if (i !== -1) this.history.normal.splice(i, 1)[0];
            song.cnt++;
            this.history.normal.push(song);
            if (this.history.normal.length > this.history.max) this.history.normal.unshift();
        },
        async _play(songOrSongs) {  // 内部函数，不要在外使用
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
                console.error('请先选择歌曲吧！');
                return;
            }
            console.log('准备获取', targetSong);
            let blob = await targetSong.fetch();
            console.log('即将开始播放', blob);
            this._recordPlayed(targetSong);
            let url = URL.createObjectURL(blob);
            this.audio.src = url;
            this.audio.controls = true;
            this.audio.play();
        },
        pause() {
            if (this.audio) this.audio.pause();
        },
        next() {
            if (!this.playingQ.length) return;
            if (this.history.recur.length) {
                this.history.normal.push(this.history.recur.pop());
                this._interruptIN(this.recent);
                this._play();
                return;
            }
            if (this.playOrder === 'queue') {
                this.nowIndex++;
                this.nowIndex %= this.playingQ.length;
            } else if (this.playOrder === 'random') {
                let limit = 3;
                do {
                    this.nowIndex = Math.floor(Math.random() * this.playingQ.length);
                } while (
                    this.nowToPlay === this.recent.song || (
                        limit-- && this.historyList.find(hi => hi === this.nowToPlay)
                    )
                );
            }
            this._play();
        },
        last() {
            if (!this.history.normal.length || !this.playingQ.length) return;
            if (this.history.normal.length === 1) {
                this._play();
                return;
            }
            this.history.recur.push(this.history.normal.pop());
            this._interruptIN(this.recent);
            this._play();
        },
        Play(songOrSongs) {
            this.history.normal = [].concat(
                this.history.normal.slice(0, -1),
                this.history.recur,
                this.history.normal.slice(-1)
            );
            this.history.recur = [];
            this._play(songOrSongs);
        }
    }
})