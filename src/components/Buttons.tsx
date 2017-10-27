import * as React from 'react';
// import { Appbar } from 'muicss/react';

class Controls extends React.Component {
    props: {
        playFunction: () => void;
        toggleGridFunction: () => void;
        toggleTurtlesFunction: () => void;
        saveCode: () => void;
        loginFunction: () => void;
        loggedIn: boolean;
        username: string;
    };

    render() {
        return (
            <div id="controls">
                <Login
                    click={this.props.loginFunction}
                    loggedIn={this.props.loggedIn}
                    username={this.props.username} />
                <Play click={this.props.playFunction} />
                <ToggleGrid click={this.props.toggleGridFunction} />
                <ToggleTurtles click={this.props.toggleTurtlesFunction} />
                <Save click={this.props.saveCode} />
            </div>
        );
    }
}


class Button extends React.Component {
    props: {
        click: () => void;
    };
}

class Login extends Button {
    props: {
        click: () => void;
        loggedIn: boolean;
        username: string;
    }

    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        if (!this.props.loggedIn) {
            return (
                <button onClick={this.props.click}>
                    Log In / Register
                </button>
            );
        } else {
            return (<span>Hi, {this.props.username}</span>);
        }
    }
}

class Save extends Button {
    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        return (
            <button onClick={this.props.click}>
                Save Code
            </button>
        );
    }
}
class Play extends Button {
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