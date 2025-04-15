import {
    SciChartSurface,

    NumericAxis,
    DateTimeNumericAxis,
    EAutoRange,

    XyDataSeries,
    OhlcDataSeries,
    NumberRange,

    VerticalLineAnnotation,
    ELabelPlacement,
    EAnnotationLayer,
    BoxAnnotation,


    FastLineRenderableSeries,
    XyScatterRenderableSeries,
    FastCandlestickRenderableSeries,
    FastColumnRenderableSeries,

    EllipsePointMarker,
    SweepAnimation,
    SciChartJsNavyTheme,
    Rect,
    Point,

    MouseWheelZoomModifier,
    ZoomPanModifier,
    RubberBandXyZoomModifier,
    ZoomExtentsModifier,
    RolloverModifier,
    LegendModifier,
    CursorModifier,
    YAxisDragModifier,
    XAxisDragModifier

} from "scichart";

import { DetectClicks } from '../../chart/chartTools/chartClickDetector.js';
import { pubsub } from '../../lib/pubsub.js';


SciChartSurface.UseCommunityLicense();


export class Chart {
    async initChart(containerId) {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(containerId, {
            theme: new SciChartJsNavyTheme(),
            title: "Chart Main",
            titleStyle: { fontSize: 22 },
            disableAspect: true,
            padding: { left: 0, top: 0, right: 0, bottom: 0 }
        });
        this.sciChartSurface = sciChartSurface;
        this.wasmContext = wasmContext;

        return this;
    }

    initAxes() {
        this.xAxis1 = new DateTimeNumericAxis(this.wasmContext, { axisTitle: "Time" });
        this.sciChartSurface.xAxes.add(this.xAxis1);

        this.yAxis1 = new NumericAxis(this.wasmContext, { axisTitle: "Price" });
        this.sciChartSurface.yAxes.add(this.yAxis1);
        // this.yAxis1.autoRange = EAutoRange.Always;

        this.yAxis2 = new NumericAxis(this.wasmContext, { axisTitle: "Volume", id: "YAxis_2" });
        this.sciChartSurface.yAxes.add(this.yAxis2);
        // this.yAxis2.autoRange = EAutoRange.Always;

        return this;
    }

    initModifiers() {
        this.mouseWheelZoomModifier = new MouseWheelZoomModifier();
        this.sciChartSurface.chartModifiers.add(this.mouseWheelZoomModifier);

        this.zoomPanModifier = new ZoomPanModifier();
        this.sciChartSurface.chartModifiers.add(this.zoomPanModifier);

        // this.rubberBandXyZoomModifier = new RubberBandXyZoomModifier();
        // this.sciChartSurface.chartModifiers.add(this.rubberBandXyZoomModifier);

        this.zoomExtentsModifier = new ZoomExtentsModifier();
        this.sciChartSurface.chartModifiers.add(this.zoomExtentsModifier);

        // this.rolloverModifier = new RolloverModifier();
        // this.sciChartSurface.chartModifiers.add(this.rolloverModifier);

        this.legendModifier = new LegendModifier({ showCheckboxes: true });
        this.sciChartSurface.chartModifiers.add(this.legendModifier);

        this.cursorModifier = new CursorModifier();
        this.sciChartSurface.chartModifiers.add(this.cursorModifier);

        this.sciChartSurface.chartModifiers.add(new YAxisDragModifier());
        this.sciChartSurface.chartModifiers.add(new XAxisDragModifier());
        
        // this.sciChartSurface.chartModifiers.add(new DetectClicks(this.clickHandler.bind(this)));

        return this;
    }

    init_annotations() {
        this.click_verticalLine = new VerticalLineAnnotation({x1: 0, stroke: "red", strokeThickness: 2, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.click_verticalLine);
        return this;
    }


    reset() {
        this.trades.clear();
        this.click_verticalLine.isHidden = true;
    }

    clickHandler(ev) {
        // console.log(ev);
        // if (ev.button !== 2) return; // only right click   
        const coordCalcX = this.xAxis1.getCurrentCoordinateCalculator();
        const coordCalcY = this.yAxis1.getCurrentCoordinateCalculator();
        const x = coordCalcX.getDataValue(ev.x);
        const y = coordCalcY.getDataValue(ev.y);
        // this.click_verticalLine.x1 = x;
        // this.click_verticalLine.isHidden = false;

        pubsub.publish('chartClick', {button: ev.button, x: x*1000, y: y});
        // get gmt date from timestamp
        // let gmtDate = new Date(x * 1000).toUTCString();
        // console.log(x, y, gmtDate);

    }

    draw_candles(candles) {
        // console.log(candles);
        let t = [];
        let o = [];
        let h = [];
        let l = [];
        let c = [];
        for (let i = 0; i < candles.length; i++) {
            t.push(candles[i].close_ts/1000.0);
            o.push(candles[i].o);
            h.push(candles[i].h);
            l.push(candles[i].l);
            c.push(candles[i].c);
        }
        this.candles_data_series = new OhlcDataSeries(this.wasmContext, {
            xValues: t,
            openValues: o,
            highValues: h,
            lowValues: l,
            closeValues: c,
            containsNaN: false,
            isSorted: true
        });
        this.candlestickSeries = new FastCandlestickRenderableSeries(this.wasmContext, {
            // strokeThickness: 1,
            dataSeries: this.candles_data_series,
            // dataPointWidth: 0.7,
            // brushUp: "#33ff3377",
            // brushDown: "#ff333377",
            // strokeUp: "#77ff77",
            // strokeDown: "#ff7777",
        });
        this.sciChartSurface.renderableSeries.add(this.candlestickSeries);
    }

    draw_depth_boundries(dls) {
        let ts = dls.get_ts().map(item => item/1000.0);
        this.asks_lower_data_series = new XyDataSeries(this.wasmContext, {
            xValues: ts,
            yValues: dls.get_lower_asks_levels(),
            isSorted: true,
            containsNaN: false
        });
        this.asks_higher_data_series = new XyDataSeries(this.wasmContext, {
            xValues: ts,
            yValues: dls.get_higher_asks_levels(),
            isSorted: true,
            containsNaN: false
        });
        this.bids_lower_data_series = new XyDataSeries(this.wasmContext, {
            xValues: ts,
            yValues: dls.get_lower_bids_levels(),
            isSorted: true,
            containsNaN: false
        });
        this.bids_higher_data_series = new XyDataSeries(this.wasmContext, {
            xValues: ts,
            yValues: dls.get_higher_bids_levels(),
            isSorted: true,
            containsNaN: false
        });
        this.asks_lower_series = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: this.asks_lower_data_series,
            stroke: "red",
            strokeThickness: 1
        });
        this.asks_higher_series = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: this.asks_higher_data_series,
            stroke: "red",
            strokeThickness: 1
        });
        this.bids_lower_series = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: this.bids_lower_data_series,
            stroke: "green",
            strokeThickness: 1
        });
        this.bids_higher_series = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: this.bids_higher_data_series,
            stroke: "green",
            strokeThickness: 1
        });
        this.sciChartSurface.renderableSeries.add(this.asks_lower_series);
        this.sciChartSurface.renderableSeries.add(this.asks_higher_series);
        this.sciChartSurface.renderableSeries.add(this.bids_lower_series);
        this.sciChartSurface.renderableSeries.add(this.bids_higher_series);
    }

    draw_asks_volumes(dls) {
        let ts = dls.get_ts().map(item => item/1000.0);
        this.asks_volumes_data_series = new XyDataSeries(this.wasmContext, {
            xValues: ts,
            yValues: dls.get_asks_volumes(),
            isSorted: true,
            containsNaN: false
        });
        this.asks_volumes_series = new FastColumnRenderableSeries(this.wasmContext, {
            dataSeries: this.asks_volumes_data_series,
            yAxisId: "YAxis_2"
        });
        this.sciChartSurface.renderableSeries.add(this.asks_volumes_series);
    }

};



