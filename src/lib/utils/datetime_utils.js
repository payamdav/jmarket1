export function datetime_day_iterator(y1, m1, d1, y2, m2, d2) {
    let date1 = Date.UTC(y1, m1 - 1, d1);
    let date2 = Date.UTC(y2, m2 - 1, d2);
    const oneDay = 24 * 60 * 60 * 1000;
    let days = [];
    for (let d = date1; d <= date2; d += oneDay) {
        let da = new Date(d);
        days.push({y: da.getUTCFullYear(), m: da.getUTCMonth() + 1, d: da.getUTCDate()});
    }
    return days;
}
