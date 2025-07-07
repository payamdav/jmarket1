import { pubsub } from '../../lib/pubsub.js';
import { Chart } from './chart.js';
import {binary_file_reader, binary_file_reader_obl_snapshots} from '../../lib/files/binaryReader.js';


class Scenario {
    constructor() {
        this.chart = new Chart();
    }

    async init() {
        await this.chart.initChart('scichart-root');
        this.chart.initAxes();
        this.chart.initModifiers();
        this.chart.init_annotations();
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
                }
    
            }

        });
    }

    async run() {
        await this.init();
        await this.load_trades();
        await this.load_zigzag();
        await this.load_stepper();
        await this.load_vols();
        await this.load_vols2();
        // await this.load_volume_areas();

    }

    async load_trades() {
        let [t, l] = await binary_file_reader("adausdt_trades", "size_t,double");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "Trades", color: "#FF6600", isDigitalLine: true, strokeThickness: 2});
    }

    async load_zigzag() {
        let [t, l] = await binary_file_reader("adausdt_zigzag_vwap_h", "size_t,double");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "adausdt_zigzag_vwap_h", color: "#006666", strokeThickness: 2});
        [t, l] = await binary_file_reader("adausdt_zigzag_vwap_m", "size_t,double");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "adausdt_zigzag_vwap_m", color: "#666600", strokeThickness: 2});
    }

    async load_stepper() {
        let [t, l] = await binary_file_reader("adausdt_stepper", "size_t,double");
        this.chart.draw_line({t: t.map(x => x / 1000.0), l: l, name: "stepper", color: "#FFFFFF", isDigitalLine: true, strokeThickness: 2});
    }

    async load_vols() {
        let [t, v, vs, vb, vd] = await binary_file_reader("adausdt_vbox", "size_t,double,double,double,double");
        this.chart.draw_columns({t: t.map(x => x / 1000.0), l: v, name: "Volume vbox", color: "#FF6600", yAxisId: "yAxisVol"});
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vs, name: "Volumes", color: "#FF6600", yAxisId: "yAxisVols"});
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vb, name: "Volumeb", color: "#FF6600", yAxisId: "yAxisVolb"});
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vd, name: "Volumed", color: "#FF6600", yAxisId: "yAxisVold"});
    }

    async load_vols2() {
        let [t, v, vs, vb, vd] = await binary_file_reader("adausdt_vbox2", "size_t,double,double,double,double");
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: v, name: "Volume", color: "#FF6600", yAxisId: "yAxisVol"});
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vs, name: "Volumes", color: "#FF6600", yAxisId: "yAxisVols"});
        // this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vb, name: "Volumeb", color: "#FF6600", yAxisId: "yAxisVolb"});
        this.chart.draw_columns({t: t.map(x => x / 1000.0), l: vd, name: "Volumed vbox2", color: "#FF6600", yAxisId: "yAxisVold"});
    }




    async load_volume_areas() {
        let [rank, ts_center, ts_start, ts_end, level_center, max_level, avg_volume] = await binary_file_reader("volume_areas", "size_t,size_t,size_t,size_t,size_t,size_t,double");
        this.chart.draw_errorbar({
            x: ts_center.map(x => x / 1000.0),
            y: level_center,
            high: ts_end.map(x => x / 1000.0),
            low: ts_start.map(x => x / 1000.0),
            name: "Volume Areas",
            color: "#FF0000",
            strokeThickness: 1,
            direction: "horizontal",
        });
    }

}

let scenario = new Scenario();
scenario.run();
