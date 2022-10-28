import { apiScanMusic } from '../tools/api';
import { defineStore } from 'pinia';
import { Song } from '../tools/songsCache'

const useSongListsStore = defineStore('songLists', {
    persist: true,
    state: () => ({
        lists: {
            allSongs: new Map(),
            liked: new Map(),
            binSongs: new Map(),
        },
        innerLists: {
            allSongs: '全部', liked: "收藏", binSongs: '回收站'
        }
    }),
    getters: {
        allLists() {
            let others = Object.keys(this.$state.lists).filter(list => !this.isInnerList(list));
            return ['allSongs', 'liked', ...others, 'binSongs'];
        },
        targetList: (state) => (listName) => {
            let res = state.lists[listName];
            if (!res) console.error('list not found:' + listName);
            else console.info('list founded: ' + listName);
            return res || [];
        },
        isInnerList: (state) => (listName) => state.innerLists[listName],
    },
    actions: {
        putIntoList(songs, listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return;
            let k = 0;
            songs.forEach(song => {
                if (!targetList.has(song.file_id)) {
                    song = new Song(song);
                    if (!song.valid) return;
                    if (listName !== 'allSongs' && !this.allSongs.has(song.file_id))
                        this.allSongs.set(song.file_id, song);
                    listName !== 'binSongs' && this.binSongs.delete(song.file_id);
                    targetList.set(song.file_id, song);
                }
            });
            return k;
        },
        delFromList(songOrSongs, listName) {
            if (songOrSongs instanceof Array) {
                songOrSongs.forEach(song => {
                    this.delFromList(song, listName);
                });
                return;
            }
            let id = songOrSongs.file_id;
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            if (!targetList.has(id)) {
                console.error(`no song with this id(${id}) in the list(${listName})`);
                return false;
            }
            if (targetList !== this.binSongs) {
                this.binSongs.set(id, targetList.get(id));
            } else {
                let confirm = window.confirm(`确认删除《 ${targetList.get(id).name} 》吗？`);
                if (!confirm) return false;
            }
            return targetList.delete(id);
        },
        clearList(listName) {
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            let confirm = window.confirm(`确认清空 ${listName} 吗？`);
            if (!confirm) return false;
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
            console.log('delList', listName);
            (listName in this.$state.lists) && delete this.$state.lists[listName];
        }
    }
});

export default useSongListsStore;