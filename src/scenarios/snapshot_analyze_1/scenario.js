import { Chart } from './chart.js';

class Scenario {
    constructor() {
        this.chart = new Chart();
        this.metadata = null;
        this.prices = [];
        this.volumes = [];
        this.candles = null;
    }

    async init() {
        await this.chart.init();
    }

    async load_metadata() {
        try {
            const response = await fetch('./data/files/snapshot_metadata.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) {
                console.error('Invalid metadata file');
                return;
            }

            const headers = lines[0].split(',');
            const values = lines[1].split(',');

            this.metadata = {};
            headers.forEach((header, i) => {
                this.metadata[header.trim()] = values[i].trim();
            });

            console.log('Metadata loaded:', this.metadata);
        } catch (e) {
            console.error('Error loading metadata:', e);
        }
    }

    async load_prices() {
        try {
            const response = await fetch('./data/files/snapshot_l1dn1d_prices_scaled.bin');
            const buffer = await response.arrayBuffer();

            const dataView = new DataView(buffer);
            const count = buffer.byteLength / 8; // 8 bytes per double

            this.prices = [];
            for (let i = 0; i < count; i++) {
                this.prices.push(dataView.getFloat64(i * 8, true)); // little endian
            }

            console.log(`Loaded ${this.prices.length} price points`);
        } catch (e) {
            console.error('Error loading prices:', e);
        }
    }

    async load_volumes() {
        try {
            const response = await fetch('./data/files/snapshot_l1dn1d_volumes_normalized.bin');
            const buffer = await response.arrayBuffer();

            const dataView = new DataView(buffer);
            const count = buffer.byteLength / 8;

            this.volumes = [];
            for (let i = 0; i < count; i++) {
                this.volumes.push(dataView.getFloat64(i * 8, true));
            }

            console.log(`Loaded ${this.volumes.length} volume points`);
        } catch (e) {
            console.error('Error loading volumes:', e);
        }
    }

    async load_candles() {
        try {
            const response = await fetch('./data/files/snapshot_l1dn1d_candles.bin');
            const buffer = await response.arrayBuffer();
            const recordSize = 13 * 8;
            const count = buffer.byteLength / recordSize;

            const dataView = new DataView(buffer);
            let t = [], o = [], h = [], l = [], c = [], v = [];
            let offset = 0;

            for (let i = 0; i < count; i++) {
                t.push(Number(dataView.getBigUint64(offset, true))); offset += 8;
                o.push(dataView.getFloat64(offset, true)); offset += 8;
                h.push(dataView.getFloat64(offset, true)); offset += 8;
                l.push(dataView.getFloat64(offset, true)); offset += 8;
                c.push(dataView.getFloat64(offset, true)); offset += 8;
                offset += 8; // vwap
                offset += 8; // n
                v.push(dataView.getFloat64(offset, true)); offset += 8;
                offset += 8; // vs
                offset += 8; // vb
                offset += 8; // q
                offset += 8; // qs
                offset += 8; // qb
            }

            this.candles = { t, o, h, l, c, v };
            console.log(`Loaded ${count} candles`);
        } catch (e) {
            console.error('Error loading candles:', e);
        }
    }

    draw_all() {
        if (this.prices.length > 0) {
            const x = Array.from({length: this.prices.length}, (_, i) => i);
            this.chart.drawScaledPrices(x, this.prices);
        }

        if (this.volumes.length > 0) {
            const x = Array.from({length: this.volumes.length}, (_, i) => i);
            this.chart.drawNormalizedVolume(x, this.volumes);
        }

        if (this.candles) {
            const t = Array.from({length: this.candles.t.length}, (_, i) => i);
            this.chart.drawCandles(t, this.candles.o, this.candles.h, this.candles.l, this.candles.c);
            this.chart.drawOriginalVolume(t, this.candles.v);
        }
    }

    async run() {
        await this.init();
        await this.load_metadata();
        await this.load_prices();
        await this.load_volumes();
        await this.load_candles();
        this.draw_all();

        if (this.metadata) {
            console.log(`Symbol: ${this.metadata.symbol}`);
            console.log(`Timestamp: ${this.metadata.ts_datetime}`);
            console.log(`Current VWAP: ${this.metadata.current_vwap}`);
        }
    }
}

const scenario = new Scenario();
scenario.run();
