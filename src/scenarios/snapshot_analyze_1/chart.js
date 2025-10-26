import {
    SciChartSurface,
    NumericAxis,
    EAutoRange,
    XyDataSeries,
    OhlcDataSeries,
    XyScatterRenderableSeries,
    FastColumnRenderableSeries,
    FastCandlestickRenderableSeries,
    EllipsePointMarker,
    SciChartJsNavyTheme,
    MouseWheelZoomModifier,
    ZoomPanModifier,
    ZoomExtentsModifier,
    LegendModifier,
    CursorModifier,
    HorizontalLineAnnotation,
    VerticalLineAnnotation,
    EAnnotationLayer,
} from "scichart";

SciChartSurface.UseCommunityLicense();

export class Chart {
    async init() {
        await this.initScaledPriceChart();
        await this.initCandlesChart();
        await this.initNormalizedVolumeChart();
        await this.initOriginalVolumeChart();
    }

    async initScaledPriceChart() {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create('chart-scaled-price', {
            theme: new SciChartJsNavyTheme(),
            title: "Scaled Prices",
            titleStyle: { fontSize: 16 }
        });
        this.scaledPriceSurface = sciChartSurface;
        this.wasmContext = wasmContext;

        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Index" });
        const yAxis = new NumericAxis(wasmContext, { axisTitle: "Scaled Price" });
        yAxis.autoRange = EAutoRange.Always;

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        sciChartSurface.chartModifiers.add(new CursorModifier());

        const zeroLine = new HorizontalLineAnnotation({
            y1: 0,
            stroke: "#FFFFFF",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        sciChartSurface.annotations.add(zeroLine);

        const currentLine = new VerticalLineAnnotation({
            x1: 86400,
            stroke: "#FF0000",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        sciChartSurface.annotations.add(currentLine);
    }

    async initCandlesChart() {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create('chart-candles', {
            theme: new SciChartJsNavyTheme(),
            title: "Candles (OHLC)",
            titleStyle: { fontSize: 16 }
        });
        this.candlesSurface = sciChartSurface;

        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Index" });
        const yAxis = new NumericAxis(wasmContext, { axisTitle: "Price" });
        yAxis.autoRange = EAutoRange.Always;

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        sciChartSurface.chartModifiers.add(new CursorModifier());

        const currentLine = new VerticalLineAnnotation({
            x1: 86400,
            stroke: "#FF0000",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        sciChartSurface.annotations.add(currentLine);
    }

    async initNormalizedVolumeChart() {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create('chart-normalized-volume', {
            theme: new SciChartJsNavyTheme(),
            title: "Normalized Volume",
            titleStyle: { fontSize: 16 }
        });
        this.normalizedVolumeSurface = sciChartSurface;

        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Index" });
        const yAxis = new NumericAxis(wasmContext, { axisTitle: "Volume (normalized)" });
        yAxis.autoRange = EAutoRange.Always;

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        sciChartSurface.chartModifiers.add(new CursorModifier());

        const currentLine = new VerticalLineAnnotation({
            x1: 86400,
            stroke: "#FF0000",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        sciChartSurface.annotations.add(currentLine);
    }

    async initOriginalVolumeChart() {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create('chart-original-volume', {
            theme: new SciChartJsNavyTheme(),
            title: "Original Volume",
            titleStyle: { fontSize: 16 }
        });
        this.originalVolumeSurface = sciChartSurface;

        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Index" });
        const yAxis = new NumericAxis(wasmContext, { axisTitle: "Volume" });
        yAxis.autoRange = EAutoRange.Always;

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        sciChartSurface.chartModifiers.add(new CursorModifier());

        const currentLine = new VerticalLineAnnotation({
            x1: 86400,
            stroke: "#FF0000",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        sciChartSurface.annotations.add(currentLine);
    }

    drawScaledPrices(x, y) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: x,
            yValues: y,
            dataSeriesName: "Scaled Prices",
            containsNaN: false,
            isSorted: true
        });

        const scatterSeries = new XyScatterRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            pointMarker: new EllipsePointMarker(this.wasmContext, {
                stroke: "#00FF00",
                fill: "#00FF00",
                width: 2,
                height: 2
            })
        });

        this.scaledPriceSurface.renderableSeries.add(scatterSeries);
    }

    drawCandles(t, o, h, l, c) {
        const dataSeries = new OhlcDataSeries(this.wasmContext, {
            xValues: t,
            openValues: o,
            highValues: h,
            lowValues: l,
            closeValues: c,
            dataSeriesName: "Candles",
            containsNaN: false,
            isSorted: true
        });

        const candleSeries = new FastCandlestickRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            strokeThickness: 1,
            dataPointWidth: 0.7,
            brushUp: "#33ff3377",
            brushDown: "#ff333377",
            strokeUp: "#00ff00",
            strokeDown: "#ff0000",
            isVisible: true
        });

        this.candlesSurface.renderableSeries.add(candleSeries);
    }

    drawNormalizedVolume(x, y) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: x,
            yValues: y,
            dataSeriesName: "Normalized Volume",
            containsNaN: false,
            isSorted: true
        });

        const columnSeries = new FastColumnRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: "#0088FF",
            fill: "#0088FF",
            isVisible: true
        });

        this.normalizedVolumeSurface.renderableSeries.add(columnSeries);
    }

    drawOriginalVolume(x, y) {
        const dataSeries = new XyDataSeries(this.wasmContext, {
            xValues: x,
            yValues: y,
            dataSeriesName: "Original Volume",
            containsNaN: false,
            isSorted: true
        });

        const columnSeries = new FastColumnRenderableSeries(this.wasmContext, {
            dataSeries: dataSeries,
            stroke: "#FF8800",
            fill: "#FF8800",
            isVisible: true
        });

        this.originalVolumeSurface.renderableSeries.add(columnSeries);
    }
}
