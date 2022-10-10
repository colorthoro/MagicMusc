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
        return test;
    }
    let res = await axios({
        method: "post",
        url: "api/dw",
        data: { hash, url },
        responseType: "blob",
    });
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

export default { fetchMusic, dbPut, dbGet };