import * as React from 'react';
import { HTML_IDS } from '../App';
import { TurtleCoder, TurtleCodeFile, DB } from '../db';
import {
    SplitButton,
    MenuItem,
    Overlay,
    OverlayTrigger,
    Popover,
    Dropdown,
    ListGroup,
    ListGroupItem
} from 'react-bootstrap';

interface FileBrowserProps extends React.Props<FileBrowser> {
    userList: Array<string>;
    userFiles: {
        [index: string]: Array<string>;
    };
    loadFile: (file: TurtleCodeFile) => void;
}
interface FileBrowserState {
    subMenus: {
        [index: string]: boolean;
    }
}
export class FileBrowser extends React.Component {
    props: FileBrowserProps;
    state: FileBrowserState;

    constructor() {
        super();
        this.setState({
            subMenus: {}
        } as FileBrowserState);
    }

    render() {

        let { userList, userFiles } = this.props;

        return (

            <SplitButton
                title="Browse our code"
                id={HTML_IDS.appheader_file_browser}
            >
                {
                    userList.map((user, index) => {
                        return (
                            <OverlayTrigger
                                key={"Overlay" + index}
                                trigger="click"
                                rootClose={true}
                                placement="right"
                                overlay={
                                    popoverWrappedFileList({
                                        username: user,
                                        loadFile: this.props.loadFile,
                                        userFileList: this.props.userFiles[user]
                                    })

                                }
                            >
                                <MenuItem key={"MenuItem" + index}>
                                    {user}
                                </MenuItem>
                            </OverlayTrigger>
                        )
                    })
                }
            </SplitButton>
        );
    }
}

function popoverWrappedFileList(p: UserFileListProps) {
    return (
        <Popover
            id={p.username + "FileList"}
        >
            <UserFileList
                loadFile={p.loadFile}
                userFileList={p.userFileList}
                username={p.username}
            />
        </Popover>
    );
}

interface UserFileListProps extends React.Props<UserFileList> {
    username: string;
    userFileList: Array<string>;
    loadFile: (file: TurtleCodeFile) => void;
}
class UserFileList extends React.Component {
    props: UserFileListProps;

    loadReadOnlyFile(username: string, filename: string) {
        DB.getUser(username).then((userData) => {
            let coder = TurtleCoder.fromObject(userData);
            this.props.loadFile(
                coder.code[filename]
            );
        }).then(() => {
            // todo : remove this hack
            let popover = document.getElementById(
                this.props.username + "FileList"
            );

            popover!.parentElement!.removeChild(popover!);
        });

    }

    render() {
        let { userFileList } = this.props;
        return (

            <ListGroup>
                {userFileList.map((file, index) => {
                    return (
                        <ListGroupItem
                            key={index}
                            onClick={
                                () => {
                                    this.loadReadOnlyFile(
                                        this.props.username,
                                        file
                                    )
                                }
                            }
                        >
                            {file}
                        </ListGroupItem>
                    );
                })}
            </ListGroup>

        )
    }
}