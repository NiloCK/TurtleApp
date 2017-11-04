import * as React from 'react';
import { TurtleCoder } from '../db';
import { Glyphicon, SplitButton, ToggleButton, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
// import { Appbar } from 'muicss/react';

class Controls extends React.Component {
    props: {
        playFunction: () => void;
        toggleGridFunction: () => void;
        toggleTurtlesFunction: () => void;
        saveCode: () => void;
        loginFunction: () => void;
        loadFile: (filename: string) => void;
        newFile: () => void;
        user?: TurtleCoder;
    };

    render() {
        return (
            <ButtonToolbar id="controls">
                {this.props.user &&
                    (
                        <SplitButton title={this.props.user.currentFile} id="fileSelect">

                            {this.props.user.getFileNames().map(
                                (file, index) =>
                                    (
                                        <MenuItem
                                            key={index}
                                            eventKey={index}
                                            title="Load this file..."
                                            onClick={() => { this.props.loadFile(file); }}
                                        >
                                            {file}
                                        </MenuItem>)
                            )}

                            <MenuItem divider={true} />

                            <MenuItem title="Create New File" onClick={this.props.newFile}>
                                {/* <Glyphicon glyph="file-plus" /> */}
                                Create New File
                            </MenuItem>

                        </SplitButton>
                    )
                }

                <Login
                    click={this.props.loginFunction}
                    loggedIn={this.props.user ? true : false}
                    username={this.props.user ? this.props.user.name : ''}
                />
                <Play click={this.props.playFunction} />
                <ToggleGrid click={this.props.toggleGridFunction} />
                <ToggleTurtles click={this.props.toggleTurtlesFunction} />
                <Save click={this.props.saveCode} />
            </ButtonToolbar>
        );
    }
}

class ControlButton extends React.Component {
    props: {
        click: () => void;
    };
}

class Login extends ControlButton {
    props: {
        click: () => void;
        loggedIn: boolean;
        username: string;
    };

    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        if (!this.props.loggedIn) {
            return (
                <Button onClick={this.props.click}>
                    Log In / Register
                </Button>
            );
        } else {
            return (<span>Hi, {this.props.username}</span>);
        }
    }
}

class Save extends ControlButton {
    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        return (
            <Button className="btn btn-primary" onClick={this.props.click}>
                Save Code
            </Button>
        );
    }
}
class Play extends ControlButton {
    constructor(props: { click: Function }) {
        super(props);
    }

    render() {
        return (
            <Button className="btn btn-primary" onClick={this.props.click}>
                Run Code
            </Button>
        );
    }
}

class ToggleGrid extends ControlButton {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <Button muted={true} className="btn btn-primary" onClick={this.props.click}>
                Show Grid
            </Button>
        );
    }
}

class ToggleTurtles extends ControlButton {
    constructor(props: { click: Function }) {
        super(props);
    }
    render() {
        return (
            <Button className="btn btn-primary" onClick={this.props.click}>
                Show Turtles
            </Button>
        );
    }
}

export { Play, ControlButton, Controls };