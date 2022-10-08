import { defineStore } from 'pinia';

const useUserStore = defineStore('user', {
    state: () => ({
        user_id: '',
        logined: false,
    })
});
export default useUserStore;