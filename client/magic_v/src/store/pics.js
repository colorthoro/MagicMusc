import { defineStore } from "pinia";

export default defineStore('pics', {  // 避免重复创建歌曲图片对象
    state: () => ({
        pics: new Map(),  // picObjId -> {urlP, cnt} 
        url2id: new Map(), // url -> picObjId
        defaultPicUrl: require("@/assets/background.png"),
        defaultIds: [],
        nextId: 1,
        cacheSize: 5,
    }),
    getters: {
        picInfo: (state) => (id, add = true) => {
            if (!state.pics.has(id)) return;
            let picInfo = state.pics.get(id);
            add && picInfo.cnt++;
            return picInfo;
        },
    },
    actions: {
        getPicUrl(song, reciver) {
            // reciver:{id, url}, id用来保证这个reciver多次异步获取时只取到最新的
            if (!song) return Promise.resolve(this.defaultPicUrl);
            let rId = ++reciver.id;
            let urlP = this.picInfo(song.picId)?.urlP;
            if (!urlP) {
                song.picId = this.nextId++;
                urlP = song.fetchPicture().then(blob => {
                    let url;
                    if (blob) {
                        url = URL.createObjectURL(blob);
                        this.url2id.set(url, song.picId);
                    } else {
                        url = this.defaultPicUrl;
                        this.defaultIds.push(song.picId);
                    }
                    console.log(song.picId, 'picUrl Promise fullfilled with', url);
                    return url;
                });
                this.pics.set(song.picId, { urlP, cnt: 1 });  // 若urlP还没有解决，则还没有占用该张图片
                this.clear();
            }
            urlP.then(url => {
                console.log(url);
                if (rId === reciver.id) {  // reciver被弃用前把id删除，就不会再进行赋值
                    if (reciver.url === url) return; // 若reciver原有一样的url，则不再递交url
                    reciver.url = url;
                }
                else console.log('该图片接收者', reciver.id ? '已经转而请求其它图片了' : '已弃用');
            });
            return urlP;
        },
        losePicUrl(url) {
            let id = this.url2id.get(url);
            if (!id) return;
            let pic = this.picInfo(id, false);
            pic.cnt--;
        },
        async clear() {
            if (this.pics.size > this.cacheSize) {
                console.log('start to clear unusing pics');
                let k = this.defaultIds.length;
                if (this.defaultIds.length) {
                    this.defaultIds.forEach(id => {
                        this.pics.delete(id);
                    });
                    this.defaultIds = [];
                    console.log('cleared useless occupations');
                    return;
                }
                for (let entry of this.pics.entries()) {
                    let id = entry[0], info = entry[1];
                    (info.cnt === 0) && await info.urlP.then(url => {
                        URL.revokeObjectURL(url);
                        console.log(id, info, 'cleared');
                        this.pics.delete(id);
                        this.url2id.delete(url);
                        k++;
                    });
                    if (k > this.cacheSize / 2) return;
                }
            }
        }
    }
});