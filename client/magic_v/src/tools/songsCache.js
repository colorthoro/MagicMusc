import {
    apiDownloadMusic, apiGetFileInfo,
    apiGetLyric, apiGetLyricFromYun,
    apiGetDetail, apiGetPic
} from "../tools/api";
import { findAllResultSongs, splitSongName } from './songSuggest';
import Dexie from "dexie";

export const db = new Dexie("magic_music");
db.version(1).stores({
    songs: "++id, &content_hash",
    pics: "++id, &song_hash"
});

export class Song {
    constructor(originObject) {
        let valid = this.test(originObject, true);
        this.valid = valid;
        this.tags = originObject.tags || [];
        this.lost = originObject.lost || false;
        this.cnt = originObject.cnt || 0;
        this.netease_id = originObject.netease_id || '';
        this.lyric = originObject.lyric || '';
        this.oneWhileData = {};
    }
    test(originObject, inject = false) {
        let list = [
            'name', 'mime_extension', 'file_id',
            'parent_file_id', 'status', 'content_hash',
            'download_url', 'size', 'trashed'
        ];
        let valid = true;
        for (const key of list) {
            if (!originObject[key]) {
                console.info('原始对象缺失属性' + key);
                if (key in ['file_id', 'content_hash', 'download_url']) {
                    valid = false;
                    console.error('可能导致无法获取');
                }
            }
            if (inject) this[key] = originObject[key];
        }
        return valid;
    }
    oneWhileManager(funcName, ...args) {  // 避免异步方法短时间内被多次异步调用
        if (funcName === 'oneWhileManager') return;
        if (!this.oneWhileData[funcName]) {
            this.oneWhileData[funcName] = this[funcName](...args).then(res => {
                delete this.oneWhileData[funcName];
                return res;
            });
        } else console.info('等待前一个异步调用结果中，调用方法：', funcName);
        return this.oneWhileData[funcName];
    }
    sameWith(song) {
        return (song instanceof Song) && (this.content_hash === song.content_hash);
    }
    async fetch() {
        let hash = this.content_hash;
        let url = this.download_url;
        let test = await db.songs.get({ content_hash: this.content_hash });
        if (test) {
            console.log('已从本地IndexedDB取得文件', hash, test);
            return test.file;
        }
        let res = await apiDownloadMusic(hash, url);
        if (res.data.type !== 'application/octet-stream') {
            if (await res.data.text() === '无效下载链接') {
                console.error('无效下载链接');
                this.lost = true;
                this.lost = ! await this.updateUrl();
                if (!this.lost) return await this.fetch();
            }
            return;
        }
        console.log('获取文件成功，准备存入IndexedDB', hash, res.data);
        db.songs.put({
            content_hash: this.content_hash,
            file: res.data,
        });
        return res.data;
    }
    async updateUrl() {
        // 根据file_id重新获取文件信息，比对download_url，不同则赋值，并改变this.lost
        console.log('正在尝试获取文件信息', this.file_id);
        let res = await apiGetFileInfo(this.file_id);
        if (res.data.download_url && res.data.download_url !== this.download_url) {
            this.download_url = res.data.download_url;
            console.log('更新下载链接成功！');
            return true;
        }
        return false;
    }
    async bindNeteaseId(refresh = false) {
        if (!refresh && this.netease_id) {
            console.log('bindNeteaseId 已存在', this.netease_id);
            return true
        }
        console.log('bindNeteaseId 正在查询网易云音乐对应歌曲id', this);
        let { best, resultSongs } = await findAllResultSongs(splitSongName(this.name));
        let bestMatch = resultSongs[best];
        if (bestMatch) {
            console.log("最终匹配：", bestMatch);
            this.netease_id = bestMatch.id;
            return true;
        }
        console.log('bindNeteaseId 查询网易云音乐对应歌曲id failed');
        return false;
    }
    fillLrc(lrc) {
        this.lyric = lrc;
    }
    async fetchLrc() {
        if (this.lyric) return this.lyric;
        console.log('在云盘查找歌词');
        let res = (await apiGetLyricFromYun(this.name)).data;
        if (res.length && res !== 'not found') {
            this.lyric = res;
            return this.lyric;
        }
        console.log('云盘未找到歌词');
        if (! await this.oneWhileManager('bindNeteaseId')) return;
        console.log('在网易云查找歌词');
        let lrc = (await apiGetLyric(this.netease_id)).data.lrc.lyric;
        console.log("得到歌词：", lrc);
        this.lyric = lrc;
        return this.lyric;
    }
    async fetchPicture() {
        console.log('在 IndexedDB 查找歌曲对应封面');
        let pic = await db.pics.get({ song_hash: this.content_hash });
        if (pic) return pic.file;
        console.log('IndexedDB 中没有歌曲对应封面');
        if (! await this.oneWhileManager('bindNeteaseId')) return;
        console.log('在网易云查找歌曲对应封面');
        let res = await apiGetDetail(this.netease_id);
        let url = res.data.songs[0].al.picUrl;
        let picFile = (await apiGetPic(url)).data;
        if (picFile) {
            db.pics.put({ song_hash: this.content_hash, file: picFile });
            return picFile;
        }
    }
}

export function replacer(key, value) {
    // console.log(key, value);
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    if (value instanceof Song && value.dataType !== 'SongIned') {
        value.dataType = 'SongIned';
    }
    return value;
}

export function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
        if (value.dataType === 'SongIned') {
            value.dataType = 'SongOuted';
            Object.setPrototypeOf(value, Song.prototype);
            return value;
        }
    }
    return value;
}