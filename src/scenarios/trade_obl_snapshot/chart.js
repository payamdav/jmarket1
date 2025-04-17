import {
    SciChartSurface,

    NumericAxis,
    DateTimeNumericAxis,
    EAutoRange,
    LeftAlignedOuterVerticallyStackedAxisLayoutStrategy,
    BottomAlignedOuterHorizontallyStackedAxisLayoutStrategy,
    EAxisAlignment,

    XyDataSeries,
    NumberRange,

    VerticalLineAnnotation,
    HorizontalLineAnnotation,
    ELabelPlacement,
    EAnnotationLayer,
    BoxAnnotation,


    FastLineRenderableSeries,
    XyScatterRenderableSeries,
    FastCandlestickRenderableSeries,

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
        this.sciChartSurface.layoutManager.bottomOuterAxesLayoutStrategy = new BottomAlignedOuterHorizontallyStackedAxisLayoutStrategy();

        this.xAxis2 = new NumericAxis(this.wasmContext, { axisTitle: "asks", id: "xAxis2", stackedAxisLength: "20%" });
        this.sciChartSurface.xAxes.add(this.xAxis2);
        this.xAxis2.autoRange = EAutoRange.Always;

        this.xAxis1 = new DateTimeNumericAxis(this.wasmContext, { axisTitle: "Time", id: "DefaultAxisId", stackedAxisLength: "60%" });
        this.sciChartSurface.xAxes.add(this.xAxis1);

        this.xAxis3 = new NumericAxis(this.wasmContext, { axisTitle: "bids", id: "xAxis3", stackedAxisLength: "20%" });
        this.sciChartSurface.xAxes.add(this.xAxis3);
        this.xAxis3.autoRange = EAutoRange.Always;

        this.yAxis1 = new NumericAxis(this.wasmContext, { axisTitle: "Levels", id: "DefaultAxisId", axisAlignment: EAxisAlignment.Left });
        this.sciChartSurface.yAxes.add(this.yAxis1);
        this.yAxis1.autoRange = EAutoRange.Always;

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

        this.sciChartSurface.chartModifiers.add(new DetectClicks(this.clickHandler.bind(this)));

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

    init_series() {
        this.asksDataSeries = new XyDataSeries(this.wasmContext, {
            dataSeriesName: "Asks",
            containsNaN: false, // set to false to avoid NaN values in the series,
            // isSorted: false // set to true if the x-values are sorted, this can improve performance
        });
        this.asksSeries = new XyScatterRenderableSeries(this.wasmContext, {
            dataSeries: this.asksDataSeries,
            xAxisId: "xAxis2",
        });
        this.sciChartSurface.renderableSeries.add(this.asksSeries);

        this.bidsDataSeries = new XyDataSeries(this.wasmContext, {
            dataSeriesName: "Bids",
            containsNaN: false, // set to false to avoid NaN values in the series,
            // isSorted: false // set to true if the x-values are sorted, this can improve performance
        });
        this.bidsSeries = new XyScatterRenderableSeries(this.wasmContext, {
            dataSeries: this.bidsDataSeries,
            xAxisId: "xAxis3",
        });
        this.sciChartSurface.renderableSeries.add(this.bidsSeries);

        this.obl_verticalLine = new VerticalLineAnnotation({x1: 0, stroke: "red", strokeThickness: 2, annotationLayer: EAnnotationLayer.Background, isHidden: true});
        this.sciChartSurface.annotations.add(this.obl_verticalLine);

        this.asks_bids_lines = [];



        return this;

    }

    draw_line({t = [], l = [], name = "", color = "#FF6600", isDigitalLine = false, strokeThickness = 2}) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: l,
            dataSeriesName: name,
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            stroke: color,
            strokeThickness: strokeThickness,
            dataSeries: dataSeries,
            // set flag isDigitalLine = true to enable a digital (step) line
            isDigitalLine: isDigitalLine,
            isVisible: false
        });
        
        this.sciChartSurface.renderableSeries.add(lineSeries);

    }

    draw_scatter({t = [], l = [], name = "", color = "#FF6600", size = 5}) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: l,
            dataSeriesName: name,
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });
        const scatterSeries = new XyScatterRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            pointMarker: new EllipsePointMarker({
                stroke: color,
                fill: color,
                width: size,
                height: size
            })
        });
        this.sciChartSurface.renderableSeries.add(scatterSeries);
    }

    draw_trades(t, l) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: l,
            dataSeriesName: "Trades",
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            stroke: "#FF6600",
            strokeThickness: 2,
            dataSeries: dataSeries,
            // set flag isDigitalLine = true to enable a digital (step) line
            isDigitalLine: true,
            isVisible: false
        });
        
        this.sciChartSurface.renderableSeries.add(lineSeries);

    }

    draw_bids(t, b) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: b,
            dataSeriesName: "Bids",
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            stroke: "#FFFFFF",
            strokeThickness: 1,
            dataSeries: dataSeries,
            yAxisId: "yAxis2",
        });
        
        this.sciChartSurface.renderableSeries.add(lineSeries);

    }

    draw_asks(t, a) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: a,
            dataSeriesName: "Asks",
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            stroke: "#FFFFFF",
            strokeThickness: 1,
            dataSeries: dataSeries,
            yAxisId: "yAxis3",
        });
        
        this.sciChartSurface.renderableSeries.add(lineSeries);

    }

    update_obl_draw(idx) {
        let levs = [];
        for (let i = this.obl.l1; i <= this.obl.l2; i++) {
            levs.push(i);
        }
        this.bidsDataSeries.clear();
        this.asksDataSeries.clear();

        this.asksDataSeries.appendRange(this.obl.asks[idx], levs);
        this.bidsDataSeries.appendRange(this.obl.bids[idx], levs);

        this.obl_verticalLine.x1 = this.obl.t[idx]
        this.obl_verticalLine.isHidden = false;
        // console.log(this.obl.t[idx]);

        console.log(this.asks_anomalies);
        console.log(this.bids_anomalies);

        for (let i = 0; i < this.asks_bids_lines.length; i++) {
            this.sciChartSurface.annotations.remove(this.asks_bids_lines[i]);
        }
        this.asks_bids_lines = [];

        for (let i = 0; i < this.asks_anomalies.length; i++) {
            const item = this.asks_anomalies[i];
            const item_annot = new HorizontalLineAnnotation({
                showLabel: false,
                stroke: "orange",
                strokeThickness: Math.floor(item.score/3),
                y1: item.level,
                annotationLayer: EAnnotationLayer.BelowChart,
            });
            this.sciChartSurface.annotations.add(item_annot);
            this.asks_bids_lines.push(item_annot);
        }

        for (let i = 0; i < this.bids_anomalies.length; i++) {
            const item = this.bids_anomalies[i];
            const item_annot = new HorizontalLineAnnotation({
                showLabel: false,
                stroke: "purple",
                strokeThickness: Math.floor(item.score/3),
                y1: item.level,
                annotationLayer: EAnnotationLayer.BelowChart,
            });
            this.sciChartSurface.annotations.add(item_annot);
            this.asks_bids_lines.push(item_annot);
        }

    }


};



