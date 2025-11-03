import {
    SciChartSurface,
    NumericAxis,
    EAutoRange,
    EAxisAlignment,
    LeftAlignedOuterVerticallyStackedAxisLayoutStrategy,
    XyDataSeries,
    OhlcDataSeries,
    FastCandlestickRenderableSeries,
    FastLineRenderableSeries,
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
        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Candle Index" });
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

    drawCandles(candles, indices, timeframe, dataPointWidth = 0.7) {
        const xValues = [];
        const openValues = [];
        const highValues = [];
        const lowValues = [];
        const closeValues = [];

        for (let i = 0; i < candles.length; i++) {
            xValues.push(indices[i]);
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
            dataSeriesName: `Candles ${timeframe}`
        });

        // Different colors for different timeframes
        let brushUp, brushDown, strokeUp, strokeDown;
        if (timeframe === '1h') {
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

    drawTrend(trend, startIdx, endIdx, trendNumber) {
        // Calculate prices at start and end using linear equation: y = slope * x + intercept
        // x is the candle number within the trend (0 to candle_count-1)
        const startPrice = trend.slope * 0 + trend.intercept;
        const endPrice = trend.slope * (trend.candle_count - 1) + trend.intercept;

        const xValues = [startIdx, endIdx];
        const yValues = [startPrice, endPrice];

        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: xValues,
            yValues: yValues,
            dataSeriesName: `Trend ${trendNumber}`
        });

        // Color based on slope: green for up, red for down
        const color = trend.slope > 0 ? "#00FF00" : "#FF0000";

        const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: color,
            strokeThickness: 3
        });

        this.sciChartSurface.renderableSeries.add(lineSeries);
    }
}
