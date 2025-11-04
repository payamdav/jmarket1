import { Chart } from './chart.js';

class Scenario {
    constructor() {
        this.chart = new Chart();
        this.candles = [];
        this.candles_1m = [];
        this.candles_1h = [];
        this.trends = [];
        this.zigzag_1 = [];
        this.zigzag_2 = [];
    }

    async init() {
        await this.chart.init('scichart-root');
    }

    async load_candles() {
        try {
            const response = await fetch('./data/files/candles_1s.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header, parse each line
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 12) continue;

                const candle = {
                    timestamp: parseInt(parts[0]),
                    datetime: parts[1],
                    open: parseFloat(parts[3]),
                    high: parseFloat(parts[4]),
                    low: parseFloat(parts[5]),
                    close: parseFloat(parts[6]),
                    vwap: parseFloat(parts[7]),
                    volume: parseFloat(parts[8])
                };

                this.candles.push(candle);
            }

            console.log(`Loaded ${this.candles.length} candles`);
        } catch (e) {
            console.error('Error loading candles:', e);
        }
    }

    async load_candles_1m() {
        try {
            const response = await fetch('./data/files/candles_1m.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header, parse each line
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 12) continue;

                const candle = {
                    timestamp: parseInt(parts[0]),
                    datetime: parts[1],
                    open: parseFloat(parts[3]),
                    high: parseFloat(parts[4]),
                    low: parseFloat(parts[5]),
                    close: parseFloat(parts[6]),
                    vwap: parseFloat(parts[7]),
                    volume: parseFloat(parts[8])
                };

                this.candles_1m.push(candle);
            }

            console.log(`Loaded ${this.candles_1m.length} 1m candles`);
        } catch (e) {
            console.error('Error loading 1m candles:', e);
        }
    }

    async load_candles_1h() {
        try {
            const response = await fetch('./data/files/candles_1h.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header, parse each line
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 12) continue;

                const candle = {
                    timestamp: parseInt(parts[0]),
                    datetime: parts[1],
                    open: parseFloat(parts[3]),
                    high: parseFloat(parts[4]),
                    low: parseFloat(parts[5]),
                    close: parseFloat(parts[6]),
                    vwap: parseFloat(parts[7]),
                    volume: parseFloat(parts[8])
                };

                this.candles_1h.push(candle);
            }

            console.log(`Loaded ${this.candles_1h.length} 1h candles`);
        } catch (e) {
            console.error('Error loading 1h candles:', e);
        }
    }

    async load_trends() {
        try {
            const response = await fetch('./data/files/trends.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 14) continue;

                const trend = {
                    trend_id: parseInt(parts[0]),
                    start_ts: parseInt(parts[1]),
                    start_datetime: parts[2],
                    end_ts: parseInt(parts[3]),
                    end_datetime: parts[4],
                    start_price: parseFloat(parts[5]),
                    end_price: parseFloat(parts[6]),
                    slope: parseFloat(parts[7]),
                    intercept: parseFloat(parts[8]),
                    r_squared: parseFloat(parts[9]),
                    error: parseFloat(parts[10]),
                    candle_count: parseInt(parts[11])
                };

                this.trends.push(trend);
            }

            console.log(`Loaded ${this.trends.length} trends`);
        } catch (e) {
            console.error('Error loading trends:', e);
        }
    }

    async load_zigzag_1() {
        try {
            const response = await fetch('./data/files/zigzag_1.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 6) continue;

                const point = {
                    trend_id: parseInt(parts[0]),
                    ts: parseInt(parts[2]),
                    price: parseFloat(parts[4])
                };

                this.zigzag_1.push(point);
            }

            console.log(`Loaded ${this.zigzag_1.length} zigzag_1 points`);
        } catch (e) {
            console.error('Error loading zigzag_1:', e);
        }
    }

    async load_zigzag_2() {
        try {
            const response = await fetch('./data/files/zigzag_2.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            if (lines.length < 2) return;

            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 6) continue;

                const point = {
                    trend_id: parseInt(parts[0]),
                    ts: parseInt(parts[2]),
                    price: parseFloat(parts[4])
                };

                this.zigzag_2.push(point);
            }

            console.log(`Loaded ${this.zigzag_2.length} zigzag_2 points`);
        } catch (e) {
            console.error('Error loading zigzag_2:', e);
        }
    }

    draw_all() {
        // Draw candles
        if (this.candles.length > 0) {
            const xValues = [];
            const timeframe = 1; // 1s
            for (let i = 0; i < this.candles.length; i++) {
                xValues.push(this.candles[i].timestamp / 1000 + timeframe / 2);
            }
            this.chart.drawCandles(this.candles, xValues, '1s', 0.7);
            console.log('Drew 1s candles');
        }

        if (this.candles_1m.length > 0) {
            const xValues = [];
            const timeframe = 60; // 60s
            for (let i = 0; i < this.candles_1m.length; i++) {
                xValues.push(this.candles_1m[i].timestamp / 1000 + timeframe / 2);
            }
            this.chart.drawCandles(this.candles_1m, xValues, '1m', 0.7);
            console.log('Drew 1m candles');
        }

        if (this.candles_1h.length > 0) {
            const xValues = [];
            const timeframe = 3600; // 3600s
            for (let i = 0; i < this.candles_1h.length; i++) {
                xValues.push(this.candles_1h[i].timestamp / 1000 + timeframe / 2);
            }
            this.chart.drawCandles(this.candles_1h, xValues, '1h', 0.7);
            console.log('Drew 1h candles');
        }

        if (this.trends.length > 0) {
            this.chart.drawTrend(this.trends);
            console.log('Drew Trends');
        }

        if (this.zigzag_1.length > 0) {
            this.chart.drawZigzag1(this.zigzag_1);
            console.log('Drew Zigzag 1');
        }

        if (this.zigzag_2.length > 0) {
            this.chart.drawZigzag2(this.zigzag_2);
            console.log('Drew Zigzag 2');
        }
    }

    async run() {
        await this.init();
        await this.load_candles();
        await this.load_candles_1m();
        await this.load_candles_1h();
        await this.load_trends();
        await this.load_zigzag_1();
        await this.load_zigzag_2();
        this.draw_all();

        console.log('\n=== Summary ===');
        console.log(`Total 1s candles: ${this.candles.length}`);
        console.log(`Total 1m candles: ${this.candles_1m.length}`);
        console.log(`Total 1h candles: ${this.candles_1h.length}`);
        console.log(`Total trends: ${this.trends.length}`);
        console.log(`Total zigzag_1 points: ${this.zigzag_1.length}`);
        console.log(`Total zigzag_2 points: ${this.zigzag_2.length}`);
    }
}

const scenario = new Scenario();
scenario.run();
