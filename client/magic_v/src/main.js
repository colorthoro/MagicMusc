import { createApp } from 'vue'
import App from './App.vue'

/** pinia 及其持久化插件 */
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

/** pinia-plugin-persistedstate 持久化map等对象需要用到的序列化方法 */
import { replacer, reviver } from './tools/songsCache'

/** vue 中方便操作 cookie 的插件 */
import VueCookies from 'vue-cookies'

/** 使用 Dexie 操作 IndexedDB 存取音乐文件的方法 */
import { fetchMusic, dbPut, dbGet } from './tools/songsCache'

const app = createApp(App);

const pinia = createPinia();
const piniaPersist = createPersistedState({  // pinia 持久化工具的全局配置
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
});
pinia.use(piniaPersist);  // 将 pinia 持久化工具注册为 pinia 插件

app.use(pinia);  // 将 pinia 注册为 Vue app 插件
app.use(VueCookies);  // 将 VueCookies 注册为 Vue app 插件

/** 将音乐存取方法集合为对象添加到 app 的全局配置对象中 */
app.config.globalProperties.songDb = { fetchMusic, dbPut, dbGet };


/** fontawesome 的图标工具 */
/** library 用于按需引入图标资源 */
import { library } from '@fortawesome/fontawesome-svg-core'
/** 展现 fontawesome 图标的 Vue 组件 */
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome'
/** 从图标集中引入具体的图标资源 */
import {
    faCirclePlay, faCirclePause,
    faBackwardStep, faForwardStep,
    faRepeat, fa1, faShuffle,
    faVolumeXmark, faVolumeOff, faVolumeLow, faVolumeHigh,
    faBars
} from '@fortawesome/free-solid-svg-icons'

library.add(
    faCirclePlay, faCirclePause,
    faBackwardStep, faForwardStep,
    faRepeat, fa1, faShuffle,
    faVolumeXmark, faVolumeOff, faVolumeLow, faVolumeHigh,
    faBars
);
app.component('font-awesome-icon', FontAwesomeIcon)
    .component('font-awesome-layers', FontAwesomeLayers)
    .component('font-awesome-layers-text', FontAwesomeLayersText);

import LoadingAcc from './base/LoadingAcc.vue';
app.component('loading-acc', LoadingAcc);

app.mount('#app');
