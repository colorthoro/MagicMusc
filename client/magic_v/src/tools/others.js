export function fixedInt(num, length = 2) {
    num = num.toFixed(0);
    return '0'.repeat(Math.max(0, length - num.length)) + num;
}

export function formalTime(secs) {
    let mins = parseInt(secs / 60);
    secs -= mins * 60;
    return fixedInt(mins) + ':' + fixedInt(secs);
}

function isMobileMaker() {
    let flag;
    return () => {
        if (flag === undefined) {
            console.log('wow');
            flag = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
                .test(navigator.userAgent);
        } else console.log('old');
        return flag;
    };
}
export const isMobile = isMobileMaker();

export function* smoothCloser(nowV, targetV, step = 1, skipTimes = 5) {
    let len = Math.abs(targetV - nowV), skip = step * skipTimes;
    if (len > skip)
        yield nowV = nowV < targetV ? targetV - skip : targetV + skip;
    while (nowV < targetV) {
        yield nowV = Math.min(nowV + step, targetV);
    }
    while (nowV > targetV) {
        yield nowV = Math.max(nowV - step, targetV);
    }
}

export function sleep(t) {
    return new Promise(ok => setTimeout(ok, t));
}

// export function oneWhileMaker(fn, ctx) {
//     let fnPromise = null;
//     let waitingCnt = 0;
//     let inner = async () => {
//         if (fnPromise) {
//             let id = waitingCnt++;
//             console.log('A same res func had been called before,',
//                 'I just need to wait for his notice.', id);
//             let fnRes = await fnPromise;
//             waitingCnt--;
//             if (waitingCnt === 0) {  // 不用担心资源竞争，因为JS异步本质上只是分批同步，而非并行。
//                 console.log('I am the last waiting func.', id);
//                 fnPromise = null;
//             }
//             return fnRes;
//         }
//         let notify = null;
//         fnPromise = new Promise(res => notify = res);
//         let fnRes = await fn.bind(ctx)(arguments);
//         notify(fnRes);
//         return fnRes;
//     }
//     return inner;
// }