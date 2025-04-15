import { pubsub } from '../../lib/pubsub.js';
import { Chart } from './chart.js';
import {binary_file_reader} from '../../lib/files/binaryReader.js';


class Scenario {
    constructor() {
        this.chart = new Chart();
    }

    async init() {
        await this.chart.initChart('scichart-root');
        this.chart.initAxes().initModifiers().init_annotations();

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
        });
    }

    async run() {
        await this.init();
        await this.load_trades();
    }

    async load_trades() {
        try {
            let [t, l] = await binary_file_reader("trades_chart_data_adausdt", "size_t,size_t");
            t = t.map(x => x / 1000.0); // convert to seconds from milliseconds for the chart
            this.chart.draw_trades(t, l); // Draw trades on the chart

        } catch (error) {
            console.error("Error in binary file reading:", error);
        }
    }




}

let scenario = new Scenario();
scenario.run();