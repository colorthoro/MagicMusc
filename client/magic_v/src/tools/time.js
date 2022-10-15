function fixedInt(num, length = 2) {
    num = num.toFixed(0);
    return '0'.repeat(Math.max(0, length - num.length)) + num;
}

export function formalTime(secs) {
    let mins = parseInt(secs / 60);
    secs -= mins * 60;
    return fixedInt(mins) + ':' + fixedInt(secs);
}