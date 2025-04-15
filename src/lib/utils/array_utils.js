export function array_slice_by_ts(a, ts1=0, ts2=0) {
    if (ts1 === 0 && ts2 === 0) return a;
    else if (ts1 === 0) return a.filter(c => c.t <= ts2);
    else if (ts2 === 0) return a.filter(c => c.t >= ts1);
    else return a.filter(c => c.t >= ts1 && c.t <= ts2);
}
