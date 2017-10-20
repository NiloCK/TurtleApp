import * as React from 'react';

class Controls extends React.Component {
    props: {
        playFunction: () => void;
        toggleGridFunction: () => void;
        toggleTurtlesFunction: () => void;
    };

    render() {
        return (
            <div>
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
            <div onClick={this.props.click}>
                Run Code
            </div>
        );
    }
}

class ToggleGrid extends Button {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <div onClick={this.props.click}>
                Show Grid
            </div>
        );
    }
}

class ToggleTurtles extends Button {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <div onClick={this.props.click}>
                Show Turtles
            </div>
        );
    }
}

export { Play, Button, Controls };