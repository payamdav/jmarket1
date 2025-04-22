export function vp(l1, l2, t, l, v, ts1, ts2=2000000000000) {
    let vp = new Array(l2 - l1 + 1).fill(0);
    for (let i = 0; i < l.length; i++) {
        if (t[i] < ts1) continue;
        if (t[i] > ts2) break;
        vp[l[i] - l1] += v[i];
    }

    return vp;
}