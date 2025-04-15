export async function single_trade_file_reader(symbol, year, month, day) {
    let trades = [];
    let filename = `./data/trades/${symbol.toUpperCase()}-trades-${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}.csv`;
    try {
        let file = await fetch(filename);
        let text = await file.text();
        let splited = text.split('\n');
        for (let i = 1; i < splited.length; i++) {
            let items = splited[i].split(',');
            let t = {
                t: parseInt(items[4]),
                p: parseFloat(items[1]),
                v: parseFloat(items[2]),
                q: parseFloat(items[3]),
                is_buyer_maker: items[5] === 'true',
            };
            if (isNaN(t.t) || isNaN(t.p) || isNaN(t.v)) continue;
            t.q = t.p * t.v; // there is a bug in binance csv file that this line must exist
            trades.push(t);
        }
    
    } catch (e) {
        console.log(`Error: ${e}`);
    }
    console.log(`Trade File: ${filename} has ${trades.length} trades`);
    return trades;    
}
