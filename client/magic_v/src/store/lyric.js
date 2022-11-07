import { defineStore, mapState } from "pinia";
import usePlayingQStore from "../store/playingQ";


const useLyricStore = defineStore("lyric", {
    state: () => ({
        offsetTime: 0,
    }),
    getters: {
        ...mapState(usePlayingQStore, ["recent", "accurateTime", "audio"]),
        lrcRows() {
            if (!this.audio || !this.recent) {
                return { rows: [], timePoint: [] };
            } else if (!this.recent.lyric.length && !this.recent.fetchLrc()) {
                return { rows: [], timePoint: [] };
            }

            let lrc = this.recent.lyric;
            let it = lrc.matchAll(
                /(\[(?<min>\d+):(?<sec>\d+(\.\d+){0,1})\])(?<content>[^[]*)/g
            );
            let current = it.next();
            let rows = [];
            let timePoint = [];
            while (!current.done) {
                let groups = current.value.groups;
                rows.push(groups.content.trim());
                timePoint.push(Number(groups.min) * 60 + Number(groups.sec));
                current = it.next();
            }
            return { rows, timePoint };
        },
        nowIndex() {
            let lb = -1,
                mid,
                ub = this.lrcRows.timePoint.length;
            while (lb < ub - 1) {
                mid = (lb + ub) >> 1;
                if (this.lrcRows.timePoint[mid] - this.offsetTime > this.accurateTime)
                    ub = mid;
                else lb = mid;
            }
            return Math.max(ub - 1, 0);
        },
        nowSentence() {
            return this.lrcRows.rows[this.nowIndex];
        },
    },
    actions: {
        setIndex(index) {
            if (index < 0 || index >= this.lrcRows.timePoint.length) return;
            if (this.audio)
                this.audio.currentTime =
                    this.lrcRows.timePoint[index] - this.offsetTime;
        },
        resetLrc(lrc = '') {
            if (this.recent) this.recent.fillLrc(lrc);
        }
    }
});
export default useLyricStore;