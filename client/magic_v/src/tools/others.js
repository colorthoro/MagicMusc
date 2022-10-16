function fixedInt(num, length = 2) {
    num = num.toFixed(0);
    return '0'.repeat(Math.max(0, length - num.length)) + num;
}

export function formalTime(secs) {
    let mins = parseInt(secs / 60);
    secs -= mins * 60;
    return fixedInt(mins) + ':' + fixedInt(secs);
}

export function isMobile() {
    let flag;
    return (() => {
        if (flag === undefined) {
            console.log('wow');
            flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
        } else console.log('old');
        return flag;
    })();
}

export function splitSongName(fileName) {
    let splitPat = / *[-_. ]+ */;
    fileName = fileName.split('.')[0];
    return fileName.split(splitPat);
}