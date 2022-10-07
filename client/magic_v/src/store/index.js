import { createStore } from 'vuex'
import axios from 'axios';

const songLists = {
    state: () => ({
        all: { list: [], ids_set: new Set() },
        lost: { list: [], ids_set: new Set() },
        bin: { list: [], ids_set: new Set() },
    }),
    mutations: {
        putIntoList(state, { songs, listName }) {
            let targetList = state[listName];
            console.log(songs)
            songs = songs.filter(song => {
                if (targetList.ids_set.has(song.file_id)) return false;
                targetList.ids_set.add(song.file_id);
                return true;
            })
            console.log(songs)
            targetList.list = targetList.list.concat(songs);
            return songs.length;
        },
        // delFromList(state, { id, listName }) {

        // }
    },
    actions: {
        async getAllSongsFromCloud(context) {
            let res = await axios.get('api/scanMusic');
            context.commit('putIntoList', { songs: res.data, listName: 'all' });
        }
    }
};

const store = createStore({
    modules: {
        songLists
    },
});



export default store;