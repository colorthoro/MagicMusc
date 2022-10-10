import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { replacer, reviver } from './tools/songsCache'
import VueCookies from 'vue-cookies'
import songDb from './tools/songsCache'

const app = createApp(App);
app.use(createPinia().use(createPersistedState({
    afterRestore: (ctx) => {
        console.log(`piniaPluginPersistedstate 恢复了 store(${ctx.store.$id}) 的数据`);
    },
    serializer: {
        serialize: value => JSON.stringify(value, replacer),
        deserialize: value => JSON.parse(value, reviver)
    }
})));
app.use(VueCookies);
app.config.globalProperties.songDb = songDb;
app.mount('#app');
