import * as React from 'react';
import { TurtleCoder } from '../db';
import {
  Glyphicon,
  SplitButton,
  ToggleButton,
  ButtonToolbar,
  Button,
  DropdownButton,
  MenuItem,
  Badge,
  Popover,
  OverlayTrigger,
  FormGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';
import { FileOptions } from './fileOptions';

class Controls extends React.Component {
  props: {
    playFunction: () => void;
    toggleGridFunction: () => void;
    toggleTurtlesFunction: () => void;
    saveCode: () => void;
    copyCode: () => void;
    loginFunction: () => void;
    loadFile: (filename: string) => void;
    newFile: () => void;
    readOnly: boolean;
    user?: TurtleCoder;
    dirtyFile: boolean;
    forceUpdate: () => void;
  };

  validateFileName = () => {

  }

  render() {
    let popover = (
      <Popover id="fileOptions" title="File Options:">
        <FileOptions
          fileName={this.props.user ? this.props.user.currentFile : ""}
          userFileNameList={this.props.user ?
            this.props.user.getFileNames() :
            []
          }
          user={this.props.user!}
          forceUpdate={this.props.forceUpdate}
        />
      </Popover>
    );
    return (
      <ButtonToolbar>
        {this.props.user &&
          (
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              rootClose={true}
              overlay={popover}>
              <SplitButton
                title={this.props.user.currentFile}
                id="fileSelect">

                {this.props.user.getFileNames().map(
                  (file, index) =>
                    (
                      <MenuItem
                        key={index}
                        eventKey={index}
                        title="Load this file..."
                        onSelect={() => { this.props.loadFile(file); }}
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
            </OverlayTrigger>
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
        {(this.props.user && !this.props.readOnly) ?
          <Save dirtyFile={this.props.dirtyFile} click={this.props.saveCode} />
          :
          ""
        }
        {(this.props.user && this.props.readOnly) ?
          <Copy click={this.props.copyCode} /> : ""
        }
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
      return (
        <Badge style={{ 'margin-left': '5px' }}>{this.props.username}</Badge>
      );
    }
  }
}

class Save extends ControlButton {
  props: {
    click: () => void;
    dirtyFile: boolean;
  }
  constructor(props: { click: Function, dirtyFile: boolean }) {
    super(props);
  }

  render() {
    return (
      <Button disabled={!this.props.dirtyFile} className="btn btn-primary" onClick={this.props.click}>
        Save Code
      </Button>
    );
  }
}

class Copy extends ControlButton {
  props: {
    click: () => void;
  }
  constructor(props: { click: Function, dirtyFile: boolean }) {
    super(props);
  }

  render() {
    return (
      <Button
        title="Make your own copy of this file."
        className="btn btn-primary"
        onClick={this.props.click}>
        Copy this file
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