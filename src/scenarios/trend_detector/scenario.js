import { Chart } from './chart.js';

class Scenario {
    constructor() {
        this.chart = new Chart();
        this.candles = [];
        this.trends = [];
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

    draw_all() {
        // Draw candles
        if (this.candles.length > 0) {
            const indices = [];
            for (let i = 0; i < this.candles.length; i++) {
                indices.push(i);
            }
            this.chart.drawCandles(this.candles, indices, '1s', 0.7);
            console.log('Drew candles');
        }

        // Draw each trend - trends are sequential, so we can use accumulated candle counts
        let startIdx = 0;
        for (let i = 0; i < this.trends.length; i++) {
            const trend = this.trends[i];
            const endIdx = startIdx + trend.candle_count - 1;

            console.log(`Trend ${i + 1}:`);
            console.log(`  Start idx: ${startIdx}, End idx: ${endIdx}`);
            console.log(`  Slope: ${trend.slope}, Intercept: ${trend.intercept}`);
            console.log(`  Candle count: ${trend.candle_count}`);

            // Draw the trend line
            this.chart.drawTrend(trend, startIdx, endIdx, i + 1);

            // Next trend starts after this one
            startIdx = endIdx + 1;
        }
    }

    async run() {
        await this.init();
        await this.load_candles();
        await this.load_trends();
        this.draw_all();

        console.log('\n=== Summary ===');
        console.log(`Total candles: ${this.candles.length}`);
        console.log(`Total trends: ${this.trends.length}`);
    }
}

const scenario = new Scenario();
scenario.run();
