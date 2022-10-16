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
