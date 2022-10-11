import axios from "axios";
import Dexie from "dexie";

const db = new Dexie("magic_music");
db.version(1).stores({
    songs: "++id, &content_hash"
});

export async function fetchMusic(hash, url) {
    let test = await dbGet(hash);
    if (test) {
        console.log('已从本地IndexedDB取得文件', hash, test);
        return test.file;
    }
    let res = await axios({
        method: "post",
        url: "api/dw",
        data: { hash, url },
        responseType: "blob",
    });
    if (res.data.type !== 'application/octet-stream') {
        throw await res.data.text();
    }
    console.log('获取文件成功，准备存入IndexedDB', hash, res.data);
    dbPut(hash, res.data);
    return res.data;
}

export async function dbPut(content_hash, blob) {
    if (await dbGet(content_hash)) {
        console.log('already in the IndexedDB!', blob);
        return;
    }
    await db.songs.put({
        content_hash: content_hash,
        file: blob,
    });
    console.log('successed to put it into IndexedDB', blob);
}

export async function dbGet(content_hash) {
    let res = await db.songs.get({ content_hash: content_hash });
    if (res) console.log('successed to get it from IndexedDB', res);
    else console.log('not in the IndexedDB!');
    return res;
}

export async function getFileInfo(file_id) {
    console.log('正在尝试获取文件信息', file_id);
    let res = await axios({
        method: 'get',
        url: 'api/getf',
        params: { file_id }
    });
    return res.data;
}

export class Song {
    constructor(originObject) {
        let valid = this.test(originObject, true);
        this.tags = [];
        this.valid = valid;
        this.lost = false;
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
    async fetch() {
        try {
            let res = await fetchMusic(this.content_hash, this.download_url);
            return res;
        } catch (e) {
            if (e === '无效下载链接') {
                this.lost = true;
                console.error('无效下载链接');
                this.lost = ! await this.updateUrl();
                if (!this.lost) this.fetch();
            }
        }
    }
    async updateUrl() {
        // 根据file_id重新获取文件信息，比对download_url，不同则赋值，并改变this.lost
        let res = await getFileInfo(this.file_id);
        if (res.download_url && res.download_url !== this.download_url) {
            this.download_url = res.download_url;
            console.log('更新下载链接成功！');
            return true;
        }
        return false;
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