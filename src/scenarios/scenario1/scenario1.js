import { pubsub } from '../../lib/pubsub.js';
import { Chart } from './chart.js';
import {candle_file_reader} from '../../lib/files/candleReader.js';
import {DepthLevels} from '../../lib/files/depthReader.js';
import {config} from '../../config.js';
import {PLevelizer} from '../../lib/ta/pip_levelizer.js';


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
        await this.load_candles();
        await this.load_depth_levelized();
    }

    async load_candles() {
        this.candles1m = await candle_file_reader('BTCUSDT', '1m', config.dt1.getUTCFullYear(), config.dt1.getUTCMonth() + 1, config.dt1.getUTCDate());
        let levelizer = new PLevelizer(10000, 150000, 0.0001);
        this.candles1m_levelized = this.candles1m.map(c => {
            return {
                t: c.t,
                close_ts: c.close_ts,
                o: levelizer.get_level_binary_search(c.o),
                h: levelizer.get_level_binary_search(c.h),
                l: levelizer.get_level_binary_search(c.l),
                c: levelizer.get_level_binary_search(c.c),
                v: c.v
            };
            }
        );
        // this.chart.draw_candles(this.candles1m);
        this.chart.draw_candles(this.candles1m_levelized);
    }

    async load_depth_levelized() {
        this.dls = new DepthLevels();
        await this.dls.read_levelized_file();
        this.dls.filter_by_ts(this.candles1m[0].t, this.candles1m[this.candles1m.length - 1].t);
        this.chart.draw_depth_boundries(this.dls);
        this.chart.draw_asks_volumes(this.dls);
    }




}

let scenario = new Scenario();
scenario.run();