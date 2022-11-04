import { defineStore } from 'pinia';
import { apiScanMusic } from '../tools/api';
import { Song } from '../tools/songsCache'

const useSongListsStore = defineStore('songLists', {
    persist: {
        paths: ['lists'],
    },
    state: () => ({
        lists: {
            allSongs: new Map(),
            liked: new Map(),
            binSongs: new Map(),
        },
        innerLists: {
            allSongs: '全部', liked: "收藏", binSongs: '回收站'
        },
        linkedLists: new Set(['allSongs', 'binSongs']),  // 保证所有歌曲对象源自这两个Map。
        modifyDialog: {
            need: false,  // 作为 AddTo.vue 的输入
            targetSongs: [],
        }
    }),
    getters: {
        allLists() {
            let others = Object.keys(this.$state.lists).filter(list => !this.isInnerList(list));
            return ['allSongs', 'liked', ...others, 'binSongs'];
        },
        addableLists() {
            return this.allLists.filter(list => list !== 'allSongs' && list !== 'binSongs');
        },
        targetList: (state) => (listName) => {
            let target = state.lists[listName];
            if (!target) console.error('list not found:' + listName);
            else if (!state.linkedLists.has(listName)) {
                for (const key of target.keys()) {
                    if (state.lists.allSongs.has(key)) {
                        target.set(key, state.lists.allSongs.get(key));
                    } else state.lists.allSongs.set(key, target.get(key));
                }
                state.linkedLists.add(listName);
            }
            return target || [];
        },
        isInnerList: (state) => (listName) => state.innerLists[listName],
    },
    actions: {
        putIntoList(songs, listName) {
            let targetList = this.targetList(listName);
            if (!targetList || targetList === this.lists.binSongs) return;
            let k = 0;
            songs.forEach(song => {
                if (!targetList.has(song.file_id)) {
                    let newSong = this.lists.allSongs.get(song.file_id) ||
                        this.lists.binSongs.get(song.file_id);
                    if (!newSong) {
                        newSong = new Song(song);
                        if (!newSong.valid) return;
                        newSong.tags.push(listName);
                    } else if (newSong.tags.indexOf(listName) === -1) {
                        newSong.tags.push(listName);
                    }
                    console.log('put', newSong.name, 'into', listName);
                    this.lists.allSongs.set(newSong.file_id, newSong);
                    this.lists.binSongs.delete(newSong.file_id);
                    k++;
                    if (targetList === this.lists.allSongs) return;
                    targetList.set(newSong.file_id, newSong);
                }
            });
            return k;
        },
        delFromList(songs, listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return;
            let k = 0;
            songs.forEach(song => {
                if (!targetList.has(song.file_id)) return;
                if (targetList === this.lists.allSongs) {
                    this.lists.binSongs.set(song.file_id, song);
                } else if (targetList === this.lists.binSongs) {
                    let confirm = window.confirm(`确认删除《 ${song.name} 》吗？`);
                    if (!confirm) return;
                }
                song.tags = song.tags.filter(tag => tag !== listName);
                console.log('del ', song.name, 'from ', listName);
                targetList.delete(song.file_id);
                k++;
            });
            return k;
        },
        clearList(listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            let confirm = window.confirm(`确认清空 ${listName} 吗？`);
            if (!confirm) return false;
            targetList.forEach(song => {
                song.tags = song.tags.filter(tag => tag !== listName);
            });
            this.$state[listName] = new Map();
            return true;
        },
        async getAllSongsFromCloud() {
            let res = await apiScanMusic();
            this.putIntoList(res.data, 'allSongs');
        },
        addNewList(listName = 'test') {
            console.log('addNewList', listName);
            this.$state.lists[listName] = new Map();
            console.log(this.$state.lists);
        },
        delList(listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            let confirm = window.confirm(`确认删除 ${listName} 吗？`);
            if (!confirm) return false;
            targetList.forEach(song => {
                song.tags = song.tags.filter(tag => tag !== listName);
            });
            delete this.$state.lists[listName];
            return true;
        },
        async syncTags(songs, newTags, needCut = false) {
            songs.forEach(song => {
                console.log('syncing', song.name, newTags);
                let added = newTags.filter(tag => song.tags.indexOf(tag) === -1);
                console.log('added', added);
                added.forEach(tag => {
                    this.putIntoList([song], tag);
                });
                if (!needCut) return;
                let cut = song.tags.filter(tag => newTags.indexOf(tag) === -1);
                console.log('cut', cut);
                cut.forEach(tag => {
                    this.delFromList([song], tag);
                });
                console.log('sync tags ok', song.name, song.tags);
            });
        },
        callModifyDialog(songs) {
            if (!songs.length) return;
            this.modifyDialog.targetSongs = songs;
            this.modifyDialog.need = true;
        },
    }
});

export default useSongListsStore;