

export class DepthLevel {
    constructor() {
        this.ts = 0;
        this.bids = [];
        this.asks = [];
        this.bids_start = 0;
        this.asks_start = 0;

    }

    parse(line) {
        let ts_position = line.indexOf('ts:');
        let bids_position = line.indexOf('bids:');
        let asks_position = line.indexOf('asks:');
        if (ts_position === -1 || bids_position === -1 || asks_position === -1) {
            return false;
        }
        this.ts = parseInt(line.substring(ts_position + 3, bids_position - 1));
        let bids_start_level_end = line.indexOf(":", bids_position + 5);
        this.bids_start = parseInt(line.substring(bids_position + 5, bids_start_level_end));
        let bids_vols = line.substring(bids_start_level_end + 1, asks_position - 1).split(",").map(item => parseInt(item));
        this.bids.push(...bids_vols);
        let asks_start_level_end = line.indexOf(':', asks_position + 5);
        this.asks_start = parseInt(line.substring(asks_position + 5, asks_start_level_end));
        let asks_vol = line.slice(asks_start_level_end + 1).split(',').map(item => parseInt(item));
        this.asks.push(...asks_vol);
        return true;
    }

    sum_bids() {
        return this.bids.reduce((acc, cur) => acc + cur, 0);
    }

    sum_asks() {
        return this.asks.reduce((acc, cur) => acc + cur, 0);
    }
}

export class DepthLevels extends Array {
    async read_levelized_file() {
        let filename = `./data/depth/levelized.txt`;
        try {
            let file = await fetch(filename);
            let text = await file.text();
            let splited = text.split('\n');
            for (let line of splited) {
                let dl = new DepthLevel();
                let result = dl.parse(line);
                if (result) this.push(dl);
            }
        
        } catch (e) {
            throw(e);
            // console.log(`Error: ${e}`);
        }
    }

    filter_by_ts(ts1, ts2) {
        let i = 0, j = 0;
        while(i < this.length) {
            const item = this[i];
            if (item.ts >= ts1 && item.ts <= ts2) this[j++] = item;
            i++;
        }
        this.length = j;
    }

    get_ts() {
        return this.map(dl => dl.ts);
    }

    get_lower_bids_levels() {
        return this.map(dl => dl.bids_start);
    }

    get_higher_bids_levels() {
        return this.map(dl => dl.bids_start + dl.bids.length);
    }

    get_lower_asks_levels() {
        return this.map(dl => dl.asks_start);
    }

    get_higher_asks_levels() {
        return this.map(dl => dl.asks_start + dl.asks.length);
    }

    get_bids_volumes() {
        return this.map(dl => dl.sum_bids());
    }

    get_asks_volumes() {
        return this.map(dl => dl.sum_asks());
    }


}