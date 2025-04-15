import { pubsub } from '../../lib/pubsub.js';
import { Chart } from './chart.js';
import {binary_file_reader, binary_file_reader_obl_snapshots} from '../../lib/files/binaryReader.js';


class Scenario {
    constructor() {
        this.chart = new Chart();
    }

    async init() {
        await this.chart.initChart('scichart-root');
        this.chart.initAxes().initModifiers().init_annotations();
        this.chart.init_series();

        // Menu Handling
        pubsub.subscribe('overlay_menu', (m) => {
            if (m === 'reset') {this.chart.reset();}
            if (m === 'fitx') {this.chart.sciChartSurface.zoomExtentsX();}
            if (m === 'fity') {this.chart.sciChartSurface.zoomExtentsY();}
            if (m === 'fitxy') {this.chart.sciChartSurface.zoomExtents();}
        });

        pubsub.subscribe('chartClick', (d) => {
            // console.log(d);
            // if (d.button === 1) this.ts = d.x; // middle key
        });

        pubsub.subscribe('cmd', (cmd) => {
            console.log(cmd);
            let tokens = cmd.split(' ');
            if (cmd === 'load trades') this.load_trades();
            if (cmd === 'draw trades') this.draw_trades();
            if (cmd === 'draw candles 1m hl') this.draw_candle_1m_hl();
            if (cmd === 'draw candles 1m vwap') this.draw_candle_1m_vwap();
            if (cmd === 'draw candles 1h hl') this.draw_candle_1h_hl();
            if (cmd === 'draw candles 1h vwap') this.draw_candle_1h_vwap();
            if (!isNaN(cmd)) {
                let idx = parseInt(cmd);
                this.chart.update_obl_draw(idx);
            }

        });
    }

    async run() {
        await this.init();
        await this.load_trades();
        await this.load_zigzag();
        await this.load_obl();

    }

    async load_trades() {
        let [t, l] = await binary_file_reader("trades_chart_data", "size_t,size_t");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "Trades", color: "#FF6600", isDigitalLine: true, strokeThickness: 2});
    }

    async load_zigzag() {
        let [t, l, h] = await binary_file_reader("zigzag_10", "size_t,size_t,bool");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "Z10", color: "#006666", strokeThickness: 2});
        [t, l, h] = await binary_file_reader("zigzag_30", "size_t,size_t,bool");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "Z30", color: "#006600", strokeThickness: 2});
        [t, l, h] = await binary_file_reader("zigzag_200", "size_t,size_t,bool");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "Z200", color: "#00ff00", strokeThickness: 2});
    }

    async load_obl() {
        let obl = await binary_file_reader_obl_snapshots("obl_cache_snapshot.bin");
        obl.t = obl.t.map(x => x / 1000.0); // convert to seconds from milliseconds for the chart
        this.chart.obl = obl;
    }



}

let scenario = new Scenario();
scenario.run();