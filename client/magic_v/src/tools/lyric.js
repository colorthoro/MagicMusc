import { apiSuggestSongsInfo, apiGetLyric } from "../tools/api";

export function splitSongName(fileName) {
    let splitPat = / *[-_.,，、/]+ */;
    fileName = fileName.split('.')[0];
    fileName = fileName.split(splitPat);
    for (let i = 0; i < fileName.length; i++) {
        fileName[i] = fileName[i].trim();
    }
    return fileName;
}

function findBestMatch(partlyResults, partlyKeys) {
    console.log(partlyResults, partlyKeys);
    for (let j = 0; j < partlyResults.length; j++) {
        let song = partlyResults[j];
        for (let k = 0; k < song.artists.length; k++) {
            let author = song.artists[k].name;
            if (partlyKeys.indexOf(author) !== -1) {
                console.log("猜测最佳匹配：", song, author);
                return j;
            } else console.log(song, author);
        }
    }
    return -1;
}
async function findAllResultSongs(keys) {
    let resultSongs = [], best = -1;
    for (let i = -1; i < keys.length; i++) {
        let key = i === -1 ? keys.join("+") : keys[i];
        console.log(`选取文件名中的第${i}个关键词(${key})作为歌名搜索中...`);
        let res = (await apiSuggestSongsInfo(key)).data;
        if (res.code !== 200 || !res.result.songs) continue;
        console.log(res.result.songs);
        let partlyBest = findBestMatch(
            res.result.songs,
            keys.slice(0, i).concat(keys.slice(i + 1, keys.length))
        );
        if (partlyBest !== -1) best = partlyBest + resultSongs.length;
        resultSongs = resultSongs.concat(res.result.songs);
        console.log("ok");
        await new Promise((ok) => setTimeout(ok, 500));
    }
    if (best === -1 && resultSongs.length) best = 0;
    return { best, resultSongs };
}
export async function queryLyric(song) {
    let keys = splitSongName(song.name);
    let { best, resultSongs } = await findAllResultSongs(keys);
    let bestMatch = resultSongs[best];
    if (bestMatch) {
        console.log("最终匹配：", bestMatch);
        let lrc = (await apiGetLyric(bestMatch.id)).data.lrc.lyric;
        console.log("得到歌词：", lrc);
        song.fillLrc(lrc);
        return true;
    }
    return false;
}