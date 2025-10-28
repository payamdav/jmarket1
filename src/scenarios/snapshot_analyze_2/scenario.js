import { Chart } from './chart.js';

class Scenario {
    constructor() {
        this.chart = new Chart();
        this.metadata = null;
        this.prices = [];
        this.volumes = [];
        this.segments = [];
        this.lowess_smoothed = [];
    }

    async init() {
        await this.chart.init('scichart-root');
    }

    async load_metadata() {
        try {
            const response = await fetch('./data/files/snapshot_metadata.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

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
            const count = buffer.byteLength / 8;

            this.prices = [];
            for (let i = 0; i < count; i++) {
                this.prices.push(dataView.getFloat64(i * 8, true));
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

    async load_segments() {
        try {
            const response = await fetch('./data/files/snapshot_segments.bin');
            const buffer = await response.arrayBuffer();
            const dataView = new DataView(buffer);

            const count = Number(dataView.getBigUint64(0, true));
            let offset = 8;

            this.segments = [];
            for (let i = 0; i < count; i++) {
                const seg = {
                    start_idx: Number(dataView.getBigUint64(offset, true)),
                    end_idx: Number(dataView.getBigUint64(offset + 8, true)),
                    slope: dataView.getFloat64(offset + 16, true),
                    intercept: dataView.getFloat64(offset + 24, true),
                    error: dataView.getFloat64(offset + 32, true)
                };
                this.segments.push(seg);
                offset += 40;
            }

            console.log(`Loaded ${this.segments.length} weighted segments`);
        } catch (e) {
            console.error('Error loading segments:', e);
        }
    }

    async load_lowess_smoothed() {
        try {
            const response = await fetch('./data/files/snapshot_l1dn1d_lowess_smoothed.bin');
            const buffer = await response.arrayBuffer();
            const dataView = new DataView(buffer);

            // Each LowessResult is: ts (8 bytes), y (8 bytes), w (8 bytes) = 24 bytes total
            const count = buffer.byteLength / 24;

            this.lowess_smoothed = [];
            for (let i = 0; i < count; i++) {
                const offset = i * 24;
                this.lowess_smoothed.push({
                    ts: Number(dataView.getBigUint64(offset, true)),
                    y: dataView.getFloat64(offset + 8, true),
                    w: dataView.getFloat64(offset + 16, true)
                });
            }

            console.log(`Loaded ${this.lowess_smoothed.length} LOWESS smoothed points`);
        } catch (e) {
            console.error('Error loading LOWESS smoothed data:', e);
        }
    }

    draw_all() {
        if (this.prices.length > 0) {
            const x = Array.from({length: this.prices.length}, (_, i) => i);
            this.chart.drawScaledPrices(x, this.prices);
        }

        if (this.volumes.length > 0) {
            const x = Array.from({length: this.volumes.length}, (_, i) => i);
            this.chart.drawVolume(x, this.volumes);
        }

        if (this.segments.length > 0) {
            this.chart.drawSegments(this.segments, "#FF00FF");
        }

        if (this.lowess_smoothed.length > 0) {
            const x = Array.from({length: this.lowess_smoothed.length}, (_, i) => i);
            const y = this.lowess_smoothed.map(point => point.y);
            this.chart.drawLowessSmoothed(x, y);
        }
    }

    async run() {
        await this.init();
        await this.load_metadata();
        await this.load_prices();
        await this.load_volumes();
        await this.load_segments();
        await this.load_lowess_smoothed();
        this.draw_all();

        if (this.metadata) {
            console.log(`Symbol: ${this.metadata.symbol}`);
            console.log(`Timestamp: ${this.metadata.ts_datetime}`);
            console.log(`Current VWAP: ${this.metadata.current_vwap}`);
            console.log(`LOWESS half_neighbor: ${this.metadata.lowess_half_neighbor}`);
        }
    }
}

const scenario = new Scenario();
scenario.run();
