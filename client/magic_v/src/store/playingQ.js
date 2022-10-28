import { defineStore } from "pinia";
import { Song } from "../tools/songsCache";
import useSongListsStore from "../store/songLists";

function syncQ(src, target) {
    for (let i = 0; i < target.length; i++) {
        if (!src.has(target[i].file_id)) continue;
        let song = src.get(target[i].file_id);
        if (song === target[i]) continue;
        song.cnt = target[i].cnt;
        target[i] = song;
    }
}

export default defineStore('playingQ', {
    persist: {
        paths: ['playingQ', 'nowIndex', 'history', 'playOrders', 'nowOrder'],
        afterRestore(ctx) {
            console.timeEnd('piniaPluginPersistedstate ' + ctx.store.$id);
            const songLists = useSongListsStore();
            console.time('sync playingQ');
            for (const srcName of ['allSongs', 'binSongs']) {
                syncQ(songLists.lists[srcName], ctx.store.$state.playingQ);
                syncQ(songLists.lists[srcName], ctx.store.$state.history.normal);
                syncQ(songLists.lists[srcName], ctx.store.$state.history.recur);
            }
            console.timeEnd('sync playingQ');
        }
    },
    state: () => ({
        playingQ: [],
        nowIndex: -1,
        history: { max: 100, normal: [], recur: [] },
        playOrders: ['queue', 'one', 'random'],
        nowOrder: 0,
        audio: null,
        accurateTime: 0,
        duration: 0,
        volume: 0,
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
            ).reverse();
        },
        playOrder(state) {
            return state.playOrders[state.nowOrder %= state.playOrders.length];
        },
        currentTime(state) {
            return parseInt(state.accurateTime);
        },
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
            let i = (song.sameWith(this.playingQ[this.nowIndex])) ?
                this.nowIndex : this.playingQ.findIndex(v => song.sameWith(v));
            this.playingQ.splice(i, 1);
            if (i === this.nowIndex) {
                this.nowIndex = i === this.playingQ.length ? i - 1 : i;
                this._play();
            } else if (i < this.nowIndex) this.nowIndex--;
        },
        _delAndInsert(song, insertWay) {
            if (song.sameWith(this.playingQ[this.nowIndex])) return;
            if (this.nowIndex < 0) this.nowIndex = 0;
            let i = this.playingQ.findIndex(v => song.sameWith(v));
            if (i !== -1) this.playingQ.splice(i, 1);
            insertWay();  // 务必保证插入位置在nowIndex之后
        },
        _justOccupy(song) {
            if (song.sameWith(this.playingQ[this.nowIndex])) return;
            let i = this.playingQ.findIndex(v => song.sameWith(v));
            if (i !== -1) { this.nowIndex = i; return; }
            this.nowIndex = Math.max(this.nowIndex, 0);
            this.playingQ.splice(this.nowIndex, 0, song);
        },
        _recordPlayed(song) {
            if (!(song instanceof Song)) return;
            if (this.recent && song.sameWith(this.recent)) {
                this.recent.cnt++;
                return;
            }
            let i = this.history.normal.findIndex(v => song.sameWith(v));
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
        _initAudio(audio) {
            audio.addEventListener('ended', () => {
                if (this.playOrder === 'one') audio.play();
                else this.next();
            });
            audio.addEventListener('timeupdate', () => {
                this.accurateTime = audio.currentTime;
            });
            audio.addEventListener('volumechange', () => {
                this.volume = audio.volume;
            })
            audio.addEventListener('loadedmetadata', () => {
                this.duration = parseInt(audio.duration);
                audio.volume = 0.8;
            });
        },
        async _play(songOrSongs) {
            if (!(this.audio instanceof Audio)) {
                var audio = new Audio();
                this._initAudio(audio);
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
            console.log('开关目标：', toStart);
            !(this.audio instanceof Audio) ? this.play() : toStart === undefined ?
                this.audio.paused ? this.audio.play() : this.audio.pause() :
                toStart ? this.audio.play() : this.audio.pause();
        },
        next() {
            if (!this.playingQ.length) return;
            if (this.history.recur.length) {
                this.history.normal.push(this.history.recur.pop());
                this._play(this.recent);
                return;
            }
            if (this.playOrder === 'random') {
                let limit = 3;
                do {
                    this.nowIndex = Math.floor(Math.random() * this.playingQ.length);
                } while (
                    this.nowToPlay.sameWith(this.recent) || (
                        limit-- && this.historyList.find(v => this.nowToPlay.sameWith(v))
                    )
                );
            } else {
                this.nowIndex++;
                this.nowIndex %= this.playingQ.length;
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