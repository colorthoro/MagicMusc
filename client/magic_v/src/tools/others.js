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