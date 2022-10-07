import { createStore } from 'vuex'
import axios from 'axios';

const store = createStore({
    state: {
        songLists: {
            all: { list: [], ids_set: new Set() },
            lost: { list: [], ids_set: new Set() },
            bin: { list: [], ids_set: new Set() },
        }
    },
    mutations: {
        /**
         * 
         * @param {array} songs
         * @param {string} songs[].file_id
         * @param {string} listName
         */
        putIntoList(state, { songs, listName }) {
            let targetList = state.songLists[listName];
            if (!targetList) {
                console.error('list not found: ' + listName);
                return 0;
            }
            console.log(songs)
            songs = songs.filter(song => {
                if (targetList.ids_set.has(song.file_id)) return false;
                targetList.ids_set.add(song.file_id);
                return true;
            })
            console.log(songs)
            targetList.list = targetList.list.concat(songs);
            return songs.length;
        }
    },
    actions: {
        async getAllSongsFromCloud(context) {
            let res = await axios.get('api/scanMusic');
            context.commit('putIntoList', { songs: res.data, listName: 'all' });
        }
    }
})

export default store;