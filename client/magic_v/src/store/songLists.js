import axios from 'axios';
import { defineStore } from 'pinia';
import { Song } from '../tools/songsCache'

const useSongListsStore = defineStore('songLists', {
    persist: true,
    state: () => ({
        allSongs: new Map(),
        binSongs: new Map(),
    }),
    getters: {
        targetList: (state) => (listName) => {
            let res = state[listName];
            if (!res) console.error('list not found: ' + listName);
            else console.info('list founded: ' + listName);
            return res;
        }
    },
    actions: {
        putIntoList({ songs, listName }) {
            // console.log(songs)
            // console.log(this);
            let targetList = this.targetList(listName);
            if (!targetList) return;
            let k = 0;
            songs.forEach(song => {
                song = new Song(song);
                if (!song.valid) return;
                if (!targetList.has(song.file_id)) {
                    targetList.set(song.file_id, song);
                }
            });
            return k;
        },
        delFromList({ id, listName }) {
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
        clearList({ listName }) {
            let targetList = this.targetList(listName);
            if (!targetList) return false;
            let confirm = window.confirm(`确认清空 ${listName} 吗？`);
            if (!confirm) return false;
            this.$state[listName] = new Map();
            return true;
        },
        async getAllSongsFromCloud() {
            let res = await axios.get('api/scanMusic');
            this.putIntoList({ songs: res.data, listName: 'allSongs' });
        }
    }
});

export default useSongListsStore;