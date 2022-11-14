import { defineStore } from "pinia";

export default defineStore('pics', {  // 避免重复创建歌曲图片对象
    state: () => ({
        pics: new Map(),  // picObjId -> {urlP, cnt} 
        url2id: new Map(), // url -> picObjId
        defaultPicUrl: require("@/assets/background.png") + '?picId=',
        nextId: 1,
        cacheSize: 50,
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
                    let url = blob ? URL.createObjectURL(blob) :
                        this.defaultPicUrl + song.picId;
                    this.url2id.set(url, song.picId);
                    return url;
                });
                this.pics.set(song.picId, { urlP, cnt: 1 });
                this.clear();
            }
            urlP.then(url => {
                if (rId === reciver.id) reciver.url = url;  // reciver被弃用前把id删除，就不会再进行赋值
                else console.log('该图片接收者', reciver.id ? '已经转而请求其它图片了' : '已弃用');
            })
            return urlP;
        },
        losePicUrl(url) {
            let id = this.url2id.get(url);
            if (!id) return;
            let pic = this.picInfo(id, false);
            pic.cnt--;
        },
        clear() {
            if (this.pics.size > this.cacheSize) {
                for (let entry of this.url2id.entries()) {
                    let url = entry[0], id = entry[1];
                    console.log(url, id);
                    if (this.picInfo(id, false).cnt === 0) {
                        URL.revokeObjectURL(url);
                        this.pics.delete(id);
                        this.url2id.delete(url);
                    }
                }
            }
        }
    }
});