import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { replacer, reviver } from './tools/songsCache'
import VueCookies from 'vue-cookies'
import { fetchMusic, dbPut, dbGet } from './tools/songsCache'

const app = createApp(App);
app.use(createPinia().use(createPersistedState({
    beforeRestore: (ctx) => {
        console.time('piniaPluginPersistedstate ' + ctx.store.$id);
    },
    afterRestore: (ctx) => {
        console.timeEnd('piniaPluginPersistedstate ' + ctx.store.$id);
    },
    serializer: {
        serialize: value => JSON.stringify(value, replacer),
        deserialize: value => JSON.parse(value, reviver)
    }
})));
app.use(VueCookies);
app.config.globalProperties.songDb = { fetchMusic, dbPut, dbGet };
app.mount('#app');
