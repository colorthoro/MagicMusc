import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";

export default defineStore('playingQ', {
    state: () => ({
        playingQ: [],
        nowIndex: -1,
        history: { max: 100, normal: [], recur: [] },
        playOrder: 'queue' || 'one' || 'random',
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
        _addToPlaying(songOrSongs, addSongMode = 'rightNow') {
            if (songOrSongs instanceof Array) {
                this.nowIndex = 0;
                let pure = songOrSongs.filter(v => v instanceof Song);
                this.playingQ = pure;
                return;
            }
            if (songOrSongs instanceof Song) {
                switch (addSongMode) {
                    case 'rightNow':
                        this._justOccupy(songOrSongs); break;
                    case 'next':
                        this._delAndInsert(songOrSongs, () => this.playingQ.splice(this.nowIndex + 1, 0, songOrSongs));
                        break;
                    case 'queue':
                        this._delAndInsert(songOrSongs, () => this.playingQ.push(songOrSongs));
                        break;
                    default:
                        console.error('unknown addSongMode!');
                }
            }
        },
        del(song) {
            if (!this.playingQ.length) return;
            let i = (song === this.playingQ[this.nowIndex]) ?
                this.nowIndex : this.playingQ.indexOf(song);
            this.playingQ.splice(i, 1);
            if (i === this.nowIndex) {
                this.nowIndex = i === this.playingQ.length ? i - 1 : i;
                this._play();
            } else if (i < this.nowIndex) this.nowIndex--;
        },
        _delAndInsert(song, insertWay) {
            if (song === this.playingQ[this.nowIndex]) return;
            if (this.nowIndex < 0) this.nowIndex = 0;
            let i = this.playingQ.indexOf(song);
            if (i !== -1) this.playingQ.splice(i, 1);
            insertWay();  // 务必保证插入位置在nowIndex之后
        },
        _justOccupy(song) {
            if (song === this.playingQ[this.nowIndex]) return;
            let i = this.playingQ.indexOf(song);
            if (i !== -1) { this.nowIndex = i; return; }
            this.nowIndex = Math.max(this.nowIndex, 0);
            this.playingQ.splice(this.nowIndex, 0, song);
        },
        _recordPlayed(song) {
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
        _resetRecur() {
            if (!this.history.recur.length) return;
            this.history.normal = [].concat(
                this.history.normal.slice(0, -1),
                this.history.recur,
                this.history.normal.slice(-1)
            );
            this.history.recur = [];
        },
        async _play(songOrSongs) {
            if (!this.audio) {
                var audio = new Audio();
                this.audio = audio;
            } else if (this.audio.src && !this.audio.paused) {
                this.audio.pause();
                URL.revokeObjectURL(this.audio.src);
            }
            songOrSongs && this._addToPlaying(songOrSongs);
            let targetSong = this.nowToPlay;
            if (!targetSong) { console.error('请先选择歌曲吧！'); return; }
            console.log('准备获取', targetSong);
            let blob = await targetSong.fetch();
            console.log('即将开始播放', blob);
            this._recordPlayed(targetSong);
            let url = URL.createObjectURL(blob);
            this.audio.src = url;
            this.audio.controls = true;
            this.audio.play();
        },
        onOff(_, toStart) {  // 忽略在vue模板里直接使用时自动传递的事件对象，方便使用
            toStart === undefined ? this.audio.paused ? this.audio.play() : this.audio.pause() :
                toStart ? this.audio.play() : this.audio.pause();
        },
        next() {
            if (!this.playingQ.length) return;
            if (this.playOrder === 'one') { this.play(); return; }
            if (this.history.recur.length) {
                this.history.normal.push(this.history.recur.pop());
                this._play(this.recent);
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
            if (this.playOrder === 'one') { this.play(); return; }
            if (this.history.normal.length === 1) {
                this._play();
                return;
            }
            this.history.recur.push(this.history.normal.pop());
            this._play(this.recent);
        },
        play(songOrSongs) {
            this._resetRecur();
            this._play(songOrSongs);
        },
        addNextPlay(songOrSongs) {
            this._addToPlaying(songOrSongs, 'next');
            this.playingQ.length === 1 ? this.play() : this._resetRecur();
        },
        addQueuePlay(songOrSongs) {
            this._addToPlaying(songOrSongs, 'queue');
            this.playingQ.length === 1 ? this.play() : this._resetRecur();
        }
    }
})