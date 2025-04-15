import {
    SciChartSurface,
    Point,
    ChartModifierBase2D,
    EChart2DModifierType,
    translateFromCanvasToSeriesViewRect,
} from "scichart";
  

export class DetectClicks extends ChartModifierBase2D {
    constructor(callback) {
        super();
        this.type = EChart2DModifierType.Custom;
        this.callback = callback;
    }

    onAttach() {
        super.onAttach();
    }
    
    onDetach() {
        super.onDetach();
    }
    
    modifierMouseUp(args) {
        super.modifierMouseUp(args);
        // console.log(args);
        try {
            if (args.pointerType !== 'mouse') return;
            let viewRectPoint = translateFromCanvasToSeriesViewRect(new Point(args.mousePoint.x, args.mousePoint.y), this.parentSurface.seriesViewRect);
            let mouse_ev = {
                button: args.button,
                x: viewRectPoint.x,
                y: viewRectPoint.y,
                altKey: args.altKey,
                ctrlKey: args.ctrlKey,
                shiftKey: args.shiftKey,
            }
    
            // console.log(mouse_ev);
            if (typeof this.callback === 'function') this.callback(mouse_ev);
        }
        catch (e) {
            console.error(e);
        }
    }
    
};


