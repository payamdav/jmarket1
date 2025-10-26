import {
    SciChartSurface,
    NumericAxis,
    EAutoRange,
    EAxisAlignment,
    LeftAlignedOuterVerticallyStackedAxisLayoutStrategy,
    XyDataSeries,
    XyScatterRenderableSeries,
    FastColumnRenderableSeries,
    FastLineRenderableSeries,
    EllipsePointMarker,
    SciChartJsNavyTheme,
    MouseWheelZoomModifier,
    ZoomPanModifier,
    ZoomExtentsModifier,
    CursorModifier,
    HorizontalLineAnnotation,
    VerticalLineAnnotation,
    EAnnotationLayer
} from "scichart";

SciChartSurface.UseCommunityLicense();

export class Chart {
    async init(containerId) {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(containerId, {
            theme: new SciChartJsNavyTheme(),
            title: "Snapshot Analyze",
            titleStyle: { fontSize: 18 }
        });
        this.sciChartSurface = sciChartSurface;
        this.wasmContext = wasmContext;

        this.sciChartSurface.layoutManager.leftOuterAxesLayoutStrategy =
            new LeftAlignedOuterVerticallyStackedAxisLayoutStrategy();

        const xAxis = new NumericAxis(wasmContext, { axisTitle: "Index" });
        this.sciChartSurface.xAxes.add(xAxis);

        const yAxisPrice = new NumericAxis(wasmContext, {
            axisTitle: "Scaled Price",
            axisAlignment: EAxisAlignment.Left,
            stackedAxisLength: "70%"
        });
        yAxisPrice.autoRange = EAutoRange.Always;
        this.sciChartSurface.yAxes.add(yAxisPrice);

        const yAxisVolume = new NumericAxis(wasmContext, {
            axisTitle: "Normalized Volume",
            id: "yAxisVolume",
            axisAlignment: EAxisAlignment.Left,
            stackedAxisLength: "30%"
        });
        yAxisVolume.autoRange = EAutoRange.Always;
        this.sciChartSurface.yAxes.add(yAxisVolume);

        this.sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
        this.sciChartSurface.chartModifiers.add(new ZoomPanModifier());
        this.sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
        this.sciChartSurface.chartModifiers.add(new CursorModifier());

        const zeroLine = new HorizontalLineAnnotation({
            y1: 0,
            stroke: "#FFFFFF",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        this.sciChartSurface.annotations.add(zeroLine);

        const currentLine = new VerticalLineAnnotation({
            x1: 86400,
            stroke: "#FF0000",
            strokeThickness: 2,
            annotationLayer: EAnnotationLayer.Background
        });
        this.sciChartSurface.annotations.add(currentLine);
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

        this.sciChartSurface.renderableSeries.add(scatterSeries);
    }

    drawVolume(x, y) {
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
            yAxisId: "yAxisVolume",
            isVisible: true
        });

        this.sciChartSurface.renderableSeries.add(columnSeries);
    }

    drawSegments(segments, color, name) {
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const x = [seg.start_idx, seg.end_idx];
            const y = [
                seg.slope * seg.start_idx + seg.intercept,
                seg.slope * seg.end_idx + seg.intercept
            ];

            const dataSeries = new XyDataSeries(this.wasmContext, {
                xValues: x,
                yValues: y,
                dataSeriesName: i === 0 ? name : undefined,
                containsNaN: false,
                isSorted: true
            });

            const lineSeries = new FastLineRenderableSeries(this.wasmContext, {
                dataSeries: dataSeries,
                stroke: color,
                strokeThickness: 2,
                isVisible: true
            });

            this.sciChartSurface.renderableSeries.add(lineSeries);
        }
    }
}
