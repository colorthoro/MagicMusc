import { defineStore } from 'pinia';


const useBackStore = defineStore('back', {
    state: () => ({
        modifyDialog: {
            need: false,  // 作为 AddTo.vue 的输入
            targetSongs: [],
        }
    }),
});

export default useBackStore;