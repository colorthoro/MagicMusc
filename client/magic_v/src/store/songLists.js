import axios from 'axios';
import { defineStore } from 'pinia';
import { fetchMusic } from '../tools/songsCache'

class Song {
    constructor(originObject) {
        let list = [
            'name', 'mime_extension', 'file_id',
            'parent_file_id', 'status', 'content_hash',
            'download_url', 'size', 'trashed'
        ];
        let valid = true;
        for (const key of list) {
            if (!originObject[key]) {
                console.info('原始对象缺失属性' + key);
                if (key in ['file_id', 'content_hash', 'download_url']) {
                    valid = false;
                    console.error('可能导致无法获取');
                }
            }
            this[key] = originObject[key];
        }
        this.tags = [];
        this.valid = valid;
    }
    async fetch() {
        let res = await fetchMusic(this.content_hash, this.download_url);
        return res;
    }
}

let testSong = {
    "file_id": "61499924a8cbabde2c984c9ebb270588359966b7",
    "name": "陈昊森 - 刻在我心底的名字.mp3",
    "parent_file_id": "60b7b3a6bfa47971afc44b4db8e4321d68d2a4cf",
    "size": 13395442,
    "status": "available"
};

function replacer(key, value) {
    console.log(key, value);
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    if (value instanceof Song && value.fetch !== 'fetchMusic') {
        value.fetch = 'fetchMusic';
    }
    return value;
}

function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
        if (value.fetch === 'fetchMusic') {
            delete value.fetch;
            Object.setPrototypeOf(value, Song.prototype);
            return value;
        }
    }
    return value;
}

const useSongListsStore = defineStore('songLists', {
    persist: {
        afterRestore: (ctx) => {
            console.log(`piniaPluginPersistedstate 恢复了 store(${ctx.store.$id}) 的数据`);
        },
        serializer: {
            serialize: value => JSON.stringify(value, replacer),
            deserialize: value => JSON.parse(value, reviver)
        }
    },
    state: () => ({
        allSongs: new Map([[testSong.file_id, testSong]]),
        lostSongs: new Map(),
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