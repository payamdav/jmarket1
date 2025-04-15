import { datetime_day_iterator } from '../utils/datetime_utils.js';

export async function single_candle_file_reader(symbol, timeframe, year, month, day) {
    let candles = [];
    let filename = `./data/candles_csv/${symbol.toUpperCase()}-${timeframe}-${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}.csv`;
    try {
        let file = await fetch(filename);
        let text = await file.text();
        let splited = text.split('\n');
        for (let i = 1; i < splited.length; i++) {
            let items = splited[i].split(',');
            let c = {
                t: parseInt(items[0]),
                o: parseFloat(items[1]),
                h: parseFloat(items[2]),
                l: parseFloat(items[3]),
                c: parseFloat(items[4]),
                v: parseFloat(items[5]),
                close_ts: parseInt(items[6]),
                q: parseFloat(items[7]),
                n: parseInt(items[8]),
                bv: parseFloat(items[9]),
                bq: parseFloat(items[10]),
            };
            if (isNaN(c.t) || isNaN(c.v)) continue;
            c.vwap = c.q / c.v;
            c.sv = c.v - c.bv;
            c.sq = c.q - c.bq;
            candles.push(c);
        }
    
    } catch (e) {
        console.log(`Error: ${e}`);
    }
    console.log(`Candle File: ${filename} has ${candles.length} candles`);
    return candles;    
}

export async function candle_file_reader(symbol, timeframe, y1, m1, d1, y2=y1, m2=m1, d2=d1) {
    let candles = [];
    let days = datetime_day_iterator(y1, m1, d1, y2, m2, d2);
    for (let day of days) {
        let c = await single_candle_file_reader(symbol, timeframe, day.y, day.m, day.d);
        candles = candles.concat(c);
    }
    return candles;    
}
