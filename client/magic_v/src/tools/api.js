import axios from "axios";

export function apiScanMusic() {
    return axios.get('api/scanMusic');
}
export function apiDownloadMusic(hash, url) {
    return axios({
        method: "get",
        url: "api/dw",
        params: { hash, url },
        responseType: "blob",
    });
}
export function apiGetFileInfo(file_id) {
    return axios({
        method: 'get',
        url: 'api/getf',
        params: { file_id }
    });
}
export function apiSuggestSongsInfo(keywords) {
    return axios({
        method: 'get',
        url: 'https://netease-music-api.fe-mm.com/search/suggest',
        params: { keywords, limit: 50, offset: 0 },
    });
}
export function apiGetLyric(id) {
    return axios({
        method: 'get',
        url: 'https://netease-music-api.fe-mm.com/lyric',
        params: { id }
    });
}

/*************************下面是酷狗音乐API************************/
export function apiKugouSongsInfo(keyword) {  // TODO: waiting for using
    return axios({
        method: 'get',
        url: 'http://msearchcdn.kugou.com/api/v3/search/song',
        params: {
            showtype: 14, highlight: em, pagesize: 30, tag_aggr: 1, tagtype: '全部',
            plat: 0, sver: 5,
            keyword,
            correct: 1, api_ver: 1, version: 9108, page: 1, area_code: 1, tag: 1, with_res_tag: 1
        },
    });
}
export function apiKugouLyric(hash, album_id) {
    return axios({
        method: 'get',
        url: 'https://wwwapi.kugou.com/yy/index.php',
        params: { r: play / getdata, hash, album_id },
    })
}
/*************************上面是酷狗音乐API************************/

export function apiRegister(user_id, sp) {
    return axios({
        url: 'api/register',
        method: 'post',
        data: { user_id, sp }
    });
}
export function apiLogin(user_id, sp) {
    return axios({
        url: 'api/login',
        method: 'post',
        data: { user_id, sp }
    });
}
