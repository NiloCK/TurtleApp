import * as React from 'react';
import { HTML_IDS } from '../App';
import { TurtleCoder, DB } from '../db';
import {
    FormGroup,
    FormControl,
    FormControlProps,
    ControlLabel,
    Button,
    HelpBlock
} from 'react-bootstrap';

interface FileOptionsState {
    allowRename: boolean;
    allowDelete: boolean;
}

interface FileOptionsProps extends React.Props<FileOptions> {
    fileName: string;
    userFileNameList: Array<string>;
    user: TurtleCoder;
    forceUpdate: () => void;
    // deleteFile: () => void;
    // renameFile: () => void;
}

export class FileOptions extends React.Component {
    props: FileOptionsProps;
    state: FileOptionsState;

    constructor(props: {}) {
        super(props);
        this.state = {
            allowRename: false,
            allowDelete: false
        };
    }

    validateFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
        let name = event.target.value;

        this.setState({
            allowRename: this.props.userFileNameList.indexOf(name) === -1
        });
    }

    validateDeleteRequest = (event: React.ChangeEvent<HTMLInputElement>) => {
        let typedName = event.target.value;

        this.setState({
            allowDelete: this.props.fileName === typedName
        });
    }

    deleteFile = () => {
        let { user } = this.props;
        user.deleteFile(user.currentFile);

        DB.updateUserData(user);
        this.props.forceUpdate();
    }

    renameFile = () => {
        let newFilename =
            (document.getElementById(HTML_IDS.fileOptions_newFilename) as HTMLInputElement)
                .value;

        let { user } = this.props;
        user.newFile(newFilename);
        user.code[newFilename] = user.getCurrentFile();
        user.code[newFilename].name = newFilename;

        user.deleteFile(user.currentFile);
        user.currentFile = newFilename;

        DB.updateUserData(user);
        this.props.forceUpdate();
    }

    render() {
        return (
            <div>
                <FormGroup >
                    <ControlLabel>
                        Rename File:
                    </ControlLabel>
                    <input
                        id={HTML_IDS.fileOptions_newFilename}
                        className="form-control"
                        type="text"
                        placeholder="New File Name"
                        defaultValue={this.props.fileName}
                        onChange={(e) => { this.validateFileName(e); }}
                    />

                </FormGroup>
                <FormGroup>
                    <Button
                        disabled={!this.state.allowRename}
                        className="btn-primary"
                        onClick={() => { this.renameFile(); }}
                    >
                        Rename File
                    </Button>
                </FormGroup>

                <hr />
                <FormGroup >
                    <ControlLabel>
                        Delete File:
                    </ControlLabel>
                    <input
                        id={HTML_IDS.fileOptions_deleteConfirmation}
                        className="form-control"
                        type="text"
                        placeholder="Filename"
                        onChange={(e) => { this.validateDeleteRequest(e); }}
                    />
                    <HelpBlock>
                        Cannot be undone! Type the name of the file that you'd like to delete to enable the button.
                    </HelpBlock>
                </FormGroup>

                <FormGroup>
                    <Button
                        disabled={!this.state.allowDelete}
                        className="btn-danger"
                        onClick={() => { this.deleteFile(); }}
                    >
                        Delete File
                    </Button>
                </FormGroup>
            </div>
        );
    }
}