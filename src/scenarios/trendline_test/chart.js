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
    HlcDataSeries,
    OhlcDataSeries,

    VerticalLineAnnotation,
    LineAnnotation,
    HorizontalLineAnnotation,
    ELabelPlacement,
    EAnnotationLayer,
    BoxAnnotation,

    FastLineRenderableSeries,
    XyScatterRenderableSeries,
    FastCandlestickRenderableSeries,
    FastMountainRenderableSeries,
    FastErrorBarsRenderableSeries,
    FastColumnRenderableSeries,

    EErrorDirection,
    EErrorMode,

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
        this.sciChartSurface.layoutManager.leftOuterAxesLayoutStrategy = new LeftAlignedOuterVerticallyStackedAxisLayoutStrategy();

        this.xAxis1 = new DateTimeNumericAxis(this.wasmContext, { axisTitle: "Time", id: "DefaultAxisId",  axisAlignment: EAxisAlignment.Bottom });
        this.sciChartSurface.xAxes.add(this.xAxis1);

        this.yAxis1 = new NumericAxis(this.wasmContext, { axisTitle: "Price", id: "DefaultAxisId", axisAlignment: EAxisAlignment.Left, stackedAxisLength: "59%" });
        this.sciChartSurface.yAxes.add(this.yAxis1);
        this.yAxis1.autoRange = EAutoRange.Always;

        this.yAxisVol = new NumericAxis(this.wasmContext, { axisTitle: "Vol", id: "yAxisVol", axisAlignment: EAxisAlignment.Left, stackedAxisLength: "10%" });
        this.sciChartSurface.yAxes.add(this.yAxisVol);
        this.yAxisVol.autoRange = EAutoRange.Always;

        this.yAxisVols = new NumericAxis(this.wasmContext, { axisTitle: "Vols", id: "yAxisVols", axisAlignment: EAxisAlignment.Left, stackedAxisLength: "10%" });
        this.sciChartSurface.yAxes.add(this.yAxisVols);
        this.yAxisVols.autoRange = EAutoRange.Always;

        this.yAxisVolb = new NumericAxis(this.wasmContext, { axisTitle: "Volb", id: "yAxisVolb", axisAlignment: EAxisAlignment.Left, stackedAxisLength: "10%" });
        this.sciChartSurface.yAxes.add(this.yAxisVolb);
        this.yAxisVolb.autoRange = EAutoRange.Always;

        this.yAxisVold = new NumericAxis(this.wasmContext, { axisTitle: "Vold", id: "yAxisVold", axisAlignment: EAxisAlignment.Left, stackedAxisLength: "10%" });
        this.sciChartSurface.yAxes.add(this.yAxisVold);
        this.yAxisVold.autoRange = EAutoRange.Always;

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

        // initialize trend line annotations
        this.up_trend_max = new LineAnnotation({x1: 0, x2: 0, y1: 0, y2: 0, stroke: "green", strokeThickness: 2, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.up_trend_max);
        this.up_trend_min = new LineAnnotation({x1: 0, x2: 0, y1: 0, y2: 0, stroke: "red", strokeThickness: 2, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.up_trend_min);

        // initialize orders annotations
        this.order_sl = new LineAnnotation({x1: 0, x2: 0, y1: 0, y2: 0, stroke: "red", strokeThickness: 4, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.order_sl);
        this.order_tp = new LineAnnotation({x1: 0, x2: 0, y1: 0, y2: 0, stroke: "green", strokeThickness: 4, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.order_tp);
        this.order_line = new LineAnnotation({x1: 0, x2: 0, y1: 0, y2: 0, stroke: "blue", strokeThickness: 2, annotationLayer: EAnnotationLayer.Background, isHidden: true,});
        this.sciChartSurface.annotations.add(this.order_line);

        return this;
    }

    reset() {
        this.trades.clear();
        this.click_verticalLine.isHidden = true;
    }

    clickHandler(ev) {
        // console.log(ev);
        if (ev.button !== 2) return; // only right click   
        const coordCalcX = this.xAxis1.getCurrentCoordinateCalculator();
        const coordCalcY = this.yAxis1.getCurrentCoordinateCalculator();
        const x = coordCalcX.getDataValue(ev.x);
        const y = coordCalcY.getDataValue(ev.y);
        this.click_verticalLine.x1 = x;
        this.click_verticalLine.isHidden = false;

        pubsub.publish('chartClick', {button: ev.button, x: x*1000, y: y});
        // get gmt date from timestamp
        let gmtDate = new Date(x * 1000).toUTCString();
        console.log(x, y, gmtDate);

    }

    init_series() {

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
            isVisible: true
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
            pointMarker: new EllipsePointMarker(this.wasmContext, {
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

    draw_errorbar({x = [], y = [], high = [], low = [], name = "", color = "#FF6600", strokeThickness = 2, direction = "horizontal"}) {
        const dataSeries = new HlcDataSeries(this.wasmContext, {
            xValues: x,
            yValues: y,
            highValues: high,
            lowValues: low,
            dataSeriesName: name,
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const errorBarSeries = new FastErrorBarsRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: color,
            strokeThickness: strokeThickness,
            isVisible: false,

            errorDirection: (direction === "horizontal") ? EErrorDirection.Horizontal : EErrorDirection.Vertical,
            errorMode: EErrorMode.Both,

            pointMarker: new EllipsePointMarker(this.wasmContext, {
                stroke: color,
                fill: color,
                width: 5,
                height: 5
            })
        });

        this.sciChartSurface.renderableSeries.add(errorBarSeries);



    }


    draw_columns({t = [], l = [], name = "", color = "#FF6600", yAxisId = "DefaultAxisId"}) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: t,
            yValues: l,
            dataSeriesName: name,
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const series = new FastColumnRenderableSeries(this.wasmContext, {
            stroke: color,
            fill: color,
            dataSeries: dataSeries,
            yAxisId: yAxisId,
            isVisible: true
        });
        
        this.sciChartSurface.renderableSeries.add(series);

    }

    draw_candlestick({t = [], o = [], h = [], l = [], c = [], name = "", color = "#FF6600"}) {
        const dataSeries = new OhlcDataSeries(this.wasmContext, {
            xValues: t,
            openValues: o,
            highValues: h,
            lowValues: l,
            closeValues: c,
            dataSeriesName: name,
            containsNaN: false, // set to false to avoid NaN values in the series,
            isSorted: true // set to true if the x-values are sorted, this can improve performance
        });

        const candleSeries = new FastCandlestickRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: color,
            strokeThickness: 1,
            dataPointWidth: 1,
            brushUp: "#33ff3377",
            brushDown: "#ff333377",
            // strokeUp: "#00ff00",
            // strokeDown: "#ff0000",
            // fillUp: "#00ff00",
            // fillDown: "#ff0000",
            isVisible: true
        });
        
        this.sciChartSurface.renderableSeries.add(candleSeries);

    }




};



