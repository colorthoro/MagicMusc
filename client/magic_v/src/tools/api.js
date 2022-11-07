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
export function apiGetDetail(id) {
    return axios({
        method: 'get',
        url: 'https://mu-api.yuk0.com/song/detail',
        params: {
            ids: id
        }
    });  // res.data.songs[0].al.picUrl 对应着专辑封面路径
}
export function apiGetPic(url, w, h) {
    return axios({
        method: 'get',
        url: url,
        params: w ? {
            param: w + 'y' + h ? h : w,
        } : null,
        responseType: 'blob',
    });
}
export function apiGetLyricFromYun(name) {
    return axios({
        method: 'get',
        url: 'api/getLrc',
        params: { name }
    });
}
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
