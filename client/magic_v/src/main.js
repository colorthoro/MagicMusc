import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VueCookies from 'vue-cookies'

createApp(App)
    .use(createPinia().use(piniaPluginPersistedstate))
    .use(VueCookies)
    .mount('#app')
