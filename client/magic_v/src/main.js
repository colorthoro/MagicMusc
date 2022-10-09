import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueCookies from 'vue-cookies'
import songDb from './tools/songs'

const app = createApp(App);
app.use(createPinia().use(piniaPluginPersistedstate));
app.use(VueCookies);
app.config.globalProperties.songDb = songDb;
app.mount('#app');
