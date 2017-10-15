import * as React from 'react';
// import './turtleCanvas.css'

class TurtleCanvas extends React.Component {
    props: {
        height: number;
        width: number;
    };
    static getGridCanvas(): HTMLCanvasElement {
        return document.getElementById('gridCanvas') as HTMLCanvasElement;
    }
    static getTurtleDrawingCanvas(): HTMLCanvasElement {
        return document.getElementById('gridCanvas') as HTMLCanvasElement;
    }

    static toggleTurtleVisibility() {
        console.log('toggling the grid...');
        let gridCanvas = TurtleCanvas.getGridCanvas();

        // todo rewrite this to use css animation for a fade in/out
        if (gridCanvas.style.getPropertyValue('opacity') !== '0') {
            gridCanvas.style.setProperty('opacity', '0');
        } else {
            gridCanvas.style.setProperty('opacity', '1');
        }
    }

    static toggleGridVisibility() {
        console.log('toggling the grid...');
        let gridCanvas = TurtleCanvas.getGridCanvas();

        // todo rewrite this to use css animation for a fade in/out
        if (gridCanvas.style.getPropertyValue('opacity') !== '0') {
            gridCanvas.style.setProperty('opacity', '0');
        } else {
            gridCanvas.style.setProperty('opacity', '1');
        }
    }

    componentDidMount() {
        let gridCanvas: HTMLCanvasElement = TurtleCanvas.getGridCanvas();
        let ctx: CanvasRenderingContext2D = gridCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.strokeStyle = 'rgb(200,200,200)';
        ctx.fillStyle = 'grey';
        ctx.font = '15px sans-serif';

        ctx.moveTo(10, 10);
        ctx.lineTo(75, 10);
        ctx.fillText('x', 65, 25);
        ctx.moveTo(10, 10);
        ctx.lineTo(10, 75);
        ctx.fillText('y', 20, 75);
        ctx.stroke();

        let vertLineCount = gridCanvas.width / 100;
        let horLineCount = gridCanvas.height / 100;

        for (let i = 1; i < vertLineCount; i++) {
            let x = i * 100;

            // ctx.setLineDash([1, 10]);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridCanvas.height);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillText(x.toString(), x + 5, 15);
        }

        for (let i = 1; i < horLineCount; i++) {
            let y = i * 100;

            // ctx.setLineDash([1, 10]);
            ctx.moveTo(0, y);
            ctx.lineTo(gridCanvas.width, y);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillText(y.toString(), 5, y + 18);
        }
    }

    render() {

        return (
            <div id="canvasLayers">
                <canvas
                    id="turtleCanvas"
                    width={this.props.width}
                    height={this.props.height}
                />
                <canvas
                    id="turtleDrawingCanvas"
                    width={this.props.width}
                    height={this.props.height}
                />
                <canvas
                    id="gridCanvas"
                    width={this.props.width}
                    height={this.props.height}
                />

            </div>
        );
    }
}

export default TurtleCanvas;