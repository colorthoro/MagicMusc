import axios from 'axios';
import { defineStore } from 'pinia';

const useSongListsStore = defineStore('songLists', {
    state: () => ({
        all: new Map(),
        lost: new Map(),
        bin: new Map(),
    }),
    getters: {
        targetList: (listName) => {
            let res = this[listName];
            if (!res) console.error('list not found: ' + listName);
            else console.info('list founded: ' + listName);
            return res;
        }
    },
    actions: {
        putIntoList({ songs, listName }) {
            // console.log(songs)
            let targetList = this.targetList(listName);
            if (!targetList) return;
            let k = 0;
            songs.forEach(song => {
                if (!targetList.has(song.file_id)) {
                    song.tags = [];
                    targetList.set(song.file_id, song);
                }
            });
            return k;
        },
        delFromList({ id, listName }) {
            let targetList = this.targetList(listName);
            if (!targetList) return;
            if (!targetList.delete(id)) {
                console.error(`no song with this id(${id}) in the list`);
            }
        },
        async getAllSongsFromCloud() {
            let res = await axios.get('api/scanMusic');
            this.putIntoList({ songs: res.data, listName: 'all' });
        }
    }
});

export default useSongListsStore;