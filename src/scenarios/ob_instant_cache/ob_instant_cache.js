import { pubsub } from '../../lib/pubsub.js';
import { Chart } from './chart.js';
import {binary_file_reader_obl_instant_cache} from '../../lib/files/binaryReader.js';


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
        await this.load_data();
    }

    async load_data() {
        try {
            let data = await binary_file_reader_obl_instant_cache("test_obl_cache.bin");
            console.log("Data received from binary file reader:");
            console.log(data);

        } catch (error) {
            console.error("Error in binary file reading:", error);
        }
    }




}

let scenario = new Scenario();
scenario.run();