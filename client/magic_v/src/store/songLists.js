import { apiScanMusic } from '../tools/api';
import { defineStore } from 'pinia';
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
            let res = state.lists[listName];
            if (!res) console.error('list not found:' + listName);
            // else console.info('list founded: ' + listName);
            return res || [];
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
                    song = new Song(song);
                    if (!song.valid) return;
                    if (targetList !== this.lists.allSongs) {
                        song.tags.push(listName);
                        !this.lists.allSongs.has(song.file_id)
                            && this.lists.allSongs.set(song.file_id, song);
                    }
                    console.log('put ', song.name, 'into ', listName);
                    this.lists.binSongs.delete(song.file_id);
                    targetList.set(song.file_id, song);
                    k++;
                }
            });
            return k;
        },
        delFromList(songs, listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return;
            let k = 0;
            songs.forEach(song => {
                let id = song.file_id;
                if (!targetList.has(id)) {
                    console.error(`no song with this id(${id}) in the list(${listName})`);
                    return;
                }
                if (targetList === this.lists.allSongs) {
                    this.lists.binSongs.set(id, targetList.get(id));
                } else if (targetList === this.lists.binSongs) {
                    let confirm = window.confirm(`确认删除《 ${targetList.get(id).name} 》吗？`);
                    if (!confirm) return;
                } else {
                    song.tags = song.tags.filter(tag => tag !== listName);
                }
                console.log('del ', song.name, 'from ', listName);
                targetList.delete(id);
                k++;
            })
            return k;
        },
        clearList(listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            let confirm = window.confirm(`确认清空 ${listName} 吗？`);
            if (!confirm) return false;
            this.$state.lists[listName].forEach(song => {
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
            this.$state.lists[listName].forEach(song => {
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
        }
    }
});

export default useSongListsStore;