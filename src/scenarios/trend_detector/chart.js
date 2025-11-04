import {
    SciChartSurface,
    NumericAxis,
    DateTimeNumericAxis,
    EAutoRange,
    EAxisAlignment,
    OhlcDataSeries,
    XyDataSeries,
    FastCandlestickRenderableSeries,
    FastLineRenderableSeries,
    FastLineSegmentRenderableSeries,
    SciChartJsNavyTheme,
    MouseWheelZoomModifier,
    ZoomPanModifier,
    ZoomExtentsModifier,
    CursorModifier,
    LegendModifier
} from "scichart";

SciChartSurface.UseCommunityLicense();

export class Chart {
    constructor() {
        this.sciChartSurface = null;
        this.wasmContext = null;
    }

    async init(containerId) {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(containerId, {
            theme: new SciChartJsNavyTheme(),
            title: "Trend Detector - Candles & Trends",
            titleStyle: { fontSize: 18 }
        });
        this.sciChartSurface = sciChartSurface;
        this.wasmContext = wasmContext;

        // X axis (candle index)
        const xAxis = new DateTimeNumericAxis(wasmContext, { axisTitle: "Time" });
        this.sciChartSurface.xAxes.add(xAxis);

        // Y axis (price)
        const yAxis = new NumericAxis(wasmContext, {
            axisTitle: "Price (VWAP)",
            axisAlignment: EAxisAlignment.Left
        });
        yAxis.autoRange = EAutoRange.Always;
        this.sciChartSurface.yAxes.add(yAxis);

        // Add modifiers
        this.sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        this.sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        this.sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        this.sciChartSurface.chartModifiers.add(new CursorModifier());
        this.sciChartSurface.chartModifiers.add(new LegendModifier({ showCheckboxes: true }));
    }

    drawCandles(candles, xValues, timeframe, dataPointWidth = 0.7) {
        const openValues = [];
        const highValues = [];
        const lowValues = [];
        const closeValues = [];

        for (let i = 0; i < candles.length; i++) {
            openValues.push(candles[i].open);
            highValues.push(candles[i].high);
            lowValues.push(candles[i].low);
            closeValues.push(candles[i].vwap);
        }

        const dataSeries = new OhlcDataSeries(this.wasmContext, {
            xValues: xValues,
            openValues: openValues,
            highValues: highValues,
            lowValues: lowValues,
            closeValues: closeValues,
            dataSeriesName: `Candles ${timeframe}`,
            containsNaN: false,
            isSorted: true
        });

        let brushUp, brushDown, strokeUp, strokeDown;
        if (timeframe === '1h') {
            brushUp = "#FF000050";
            brushDown = "#0000FF50";
            strokeUp = "#FF0000";
            strokeDown = "#0000FF";
        } else if (timeframe === '1m') {
            brushUp = "#0000FF50";
            brushDown = "#FF00FF50";
            strokeUp = "#0000FF";
            strokeDown = "#FF00FF";
        } else {
            brushUp = "#00FF0050";
            brushDown = "#FF000050";
            strokeUp = "#00FF00";
            strokeDown = "#FF0000";
        }

        const candlestickSeries = new FastCandlestickRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            strokeThickness: timeframe === '1h' ? 2 : 1,
            dataPointWidth: dataPointWidth,
            brushUp: brushUp,
            brushDown: brushDown,
            strokeUp: strokeUp,
            strokeDown: strokeDown
        });

        this.sciChartSurface.renderableSeries.add(candlestickSeries);
    }

    drawTrend(trends) {
        const xValues = [];
        const yValues = [];

        for (const trend of trends) {
            const startPrice = trend.slope * 0 + trend.intercept;
            const endPrice = trend.slope * (trend.candle_count - 1) + trend.intercept;

            xValues.push(trend.start_ts / 1000, trend.end_ts / 1000);
            yValues.push(startPrice, endPrice);
        }

        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: xValues,
            yValues: yValues,
            dataSeriesName: "Trends",
            containsNaN: false,
            isSorted: true
        });

        const lineSeries = new FastLineSegmentRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: "#00FF00",
            strokeThickness: 3
        });

        this.sciChartSurface.renderableSeries.add(lineSeries);
    }

    drawZigzag1(points) {
        const xValues = [];
        const yValues = [];
        let lastTrendId = -1;

        for (const point of points) {
            if (lastTrendId !== -1 && lastTrendId !== point.trend_id) {
                xValues.push(point.ts / 1000);
                yValues.push(NaN);
            }
            xValues.push(point.ts / 1000);
            yValues.push(point.price);
            lastTrendId = point.trend_id;
        }

        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: xValues,
            yValues: yValues,
            dataSeriesName: "Zigzag 1",
            containsNaN: true
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: "#FFFFFF",
            strokeThickness: 2
        });

        this.sciChartSurface.renderableSeries.add(lineSeries);
    }

    drawZigzag2(points) {
        const xValues = [];
        const yValues = [];
        let lastTrendId = -1;

        for (const point of points) {
            if (lastTrendId !== -1 && lastTrendId !== point.trend_id) {
                xValues.push(point.ts / 1000);
                yValues.push(NaN);
            }
            xValues.push(point.ts / 1000);
            yValues.push(point.price);
            lastTrendId = point.trend_id;
        }

        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: xValues,
            yValues: yValues,
            dataSeriesName: "Zigzag 2",
            containsNaN: true
        });

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: "#FFFF00", // Yellow color for zigzag_2
            strokeThickness: 2
        });

        this.sciChartSurface.renderableSeries.add(lineSeries);
    }

}
