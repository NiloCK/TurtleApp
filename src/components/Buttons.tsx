import * as React from 'react';
// import { Appbar } from 'muicss/react';

class Controls extends React.Component {
    props: {
        playFunction: () => void;
        toggleGridFunction: () => void;
        toggleTurtlesFunction: () => void;
    };

    render() {
        return (
            <div id="controls">
                <Play click={this.props.playFunction} />
                <ToggleGrid click={this.props.toggleGridFunction} />
                <ToggleTurtles click={this.props.toggleTurtlesFunction} />
            </div>
        );
    }
}

class Button extends React.Component {
    props: {
        click: () => void;
    };
}

class Play extends Button {

    handleClick = () => {
        alert('Hi again');
    }
    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>
                Run Code
            </button>
        );
    }
}

class ToggleGrid extends Button {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <button onClick={this.props.click}>
                Show Grid
            </button>
        );
    }
}

class ToggleTurtles extends Button {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <button onClick={this.props.click}>
                Show Turtles
            </button>
        );
    }
}

export { Play, Button, Controls };