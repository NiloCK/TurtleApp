import * as React from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import { Play, Controls } from './components/Buttons';
import { LoginModal } from './components/Login';
import { FileBrowser } from './components/fileBrowser';
import TurtleCanvas from './components/turtleCanvas';
import ProgramCompiler from './ProgramExecution';
import { DB, TurtleCoder, TurtleCodeFile, AuthorList } from './db';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Modal,
  Label,
  SplitButton,
  Navbar,
  Nav,
  Button,
  NavItem
} from 'react-bootstrap';
// import Student from './student';

const logo = require('./logo.svg');

export const enum HTML_IDS {
  login_username = 'loginField',
  login_password = 'passwordField',
  login_retype_password = 'retypePasswordField',
  new_filename = 'newFilenameField',
  appheader_file_browser = 'fileBrowser',
  fileOptions_newFilename = 'newFilename',
  fileOptions_deleteConfirmation = 'deleteConfirmation',
  fileOptions_popover = 'fileOptions_popover'
}

class AppState {
  showLoginModal: boolean;
  showNewFileModal: boolean;
  editingMode: boolean;
  openedFile?: TurtleCodeFile;
  user?: TurtleCoder;
  dirtyFile: boolean;
  userList: Array<string>;
  userFiles: {
    [index: string]: Array<string>;
  };
}

class App extends React.Component {
  editor: monaco.editor.ICodeEditor;
  loginModalVisible: boolean = false;

  state: AppState;

  constructor() {
    super();
    this.state = {
      showNewFileModal: false,
      showLoginModal: false,
      editingMode: true,
      openedFile: undefined,
      user: undefined,
      dirtyFile: false,
      userList: [],
      userFiles: {}
    };
  }

  componentWillMount() {
    DB.getAllUserData().then((users) => {
      let userList = new Array<string>();
      let userFiles = {};

      users.rows.forEach((user) => {
        userList.push(user.id);
        let coder = TurtleCoder.fromObject(user.doc);
        userFiles[user.id] = coder.getFileNames();
      });
      userList.sort();

      this.setState({
        userList: userList,
        userFiles: userFiles
      } as AppState);
    });
  }

  setState(s: { editingMode?: boolean } | any) {
    super.setState(s);

    if (typeof s.editingMode !== 'undefined') {
      this.editor.updateOptions({
        readOnly: !s.editingMode
      });
    }
  }

  handleEditorDidMount = (editor: {}) => {
    this.editor = editor as monaco.editor.ICodeEditor;
    this.loadUserCurrentFile();
  }

  loadUserCurrentFile = () => {

    if (this.state.user) {
      let newCode = this.state.user.getCurrentFile();
      this.setState({
        editingMode: true,
        openedFile: newCode
      } as AppState);
      this.editor.updateOptions({
        readOnly: false
      });
      this.editor.setValue(newCode.code);
    } else {
      this.editor.setValue(
        `// Type your code here! Log in / register to save your work
      
let tom = new Turtle();`);
    }
  }

  loadFile = (filename: string) => {
    if (this.state.user && this.state.user.code[filename]) {
      this.state.user.currentFile = filename;
      this.loadUserCurrentFile();
    } else {
      throw new Error(`File not found in this user's data`);
    }
  }

  updateUser(user: TurtleCoder) {
    this.setState({
      user: user
    } as AppState);
  }

  newFileDialog = () => {
    if (this.state.user) {
      this.setState({
        showNewFileModal: true
      } as AppState);
    } else {
      throw new Error(`Must be logged in to create a file`);
    }
  }

  newFile = () => {
    if (this.state.user && this.state.showNewFileModal) {
      let name: string = (document.getElementById(HTML_IDS.new_filename) as HTMLInputElement).value;
      this.state.user.newFile(name);
      this.state.user.currentFile = name;
      this.loadUserCurrentFile();
      this.setState({
        showNewFileModal: false
      } as AppState);
    }
  }

  openLoginModal = () => {
    this.setState({
      showLoginModal: true
    });
  }
  closeLoginModal = () => {
    this.setState({
      showLoginModal: false
    });
  }

  login = () => {
    let user: string = (document.getElementById(HTML_IDS.login_username) as HTMLInputElement).value;
    let pw: string = (document.getElementById(HTML_IDS.login_password) as HTMLInputElement).value;

    this.loadUserData(user, pw).catch((reason) => {
      // reason.reason === 'missing'
      this.promptToCreateNewUser(user, pw);
    });
  }

  saveEditorCode = () => {
    if (this.state.user) {
      let { user } = this.state;
      // let authors = user.getCurrentFile().authors;
      let constructedUser = TurtleCoder.fromObject(user);
      TurtleCodeFile.addAuthor(constructedUser.getCurrentFile(), user.name);

      let ts = this.editor.getValue();

      DB.saveCode(
        this.state.user.name,
        {
          name: user.currentFile,
          code: ts,
          authors: constructedUser.getCurrentFile().authors
        }
      ).then(() => {
        if (this.state.user) {
          this.loadUserData(this.state.user.name, this.state.user.pw);
        }
      });
    } else {
      alert('You must be logged in to save code.');
    }
  }

  makeACopyOfEditorCode = () => {
    let { user, openedFile, editingMode } = this.state;

    if (user && openedFile && !editingMode) {
      let constructedFile = TurtleCodeFile.fromObject(openedFile);
      TurtleCodeFile.addAuthor(constructedFile, user.name);

      let newFilename = constructedFile.name;

      while (user.getFileNames().indexOf(newFilename) >= 0) {
        newFilename = prompt(`You already have a file called ${newFilename}.
Please choose a different name for this file:`)!;
      }

      constructedFile.name = newFilename;

      DB.saveCode(
        user.name,
        constructedFile
      ).then(() => {
        if (user) {
          this.loadUserData(user.name, user.pw);
        }
      });
    }
  }

  runEditorCode = () => {
    this.clearTurtleCanvas();
    let ts = this.editor.getValue();
    let js = new ProgramCompiler(ts).getJS();

    if (this.state.user && this.state.dirtyFile) {
      this.saveEditorCode();
    }

    eval(js);
  }

  clearTurtleCanvas = () => {
    let cvs = document.getElementById('turtleCanvas') as HTMLCanvasElement;
    let ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
  }

  getEditorCode = () => {
    return this.editor.getValue();
  }

  getRandomFile = () => {
    // console.log('Getting a random file...');
    DB.getListOfUsernames().then((users) => {
      let userIndex = Math.floor(Math.random() * users.total_rows);

      DB.getUser(users.rows[userIndex].id).then((turtleCoder) => {
        let fileCount = Object.keys(turtleCoder.code).length;
        let fileIndex = Math.floor(Math.random() * fileCount);
        let key = Object.keys(turtleCoder.code)[fileIndex];

        this.loadReadonlyFile(turtleCoder.code[key]);
      }).then(() => {
        this.runEditorCode();
      }).catch((e) => {
        this.getRandomFile();
      });
    });
  }

  loadReadonlyFile(file: TurtleCodeFile) {
    this.setState({
      editingMode: false,
      openedFile: file
    } as AppState);
    this.editor.setValue(file.code);
  }

  registerNewUser = () => {
    let user: string = (document.getElementById(HTML_IDS.login_username) as HTMLInputElement).value;
    let pw: string = (document.getElementById(HTML_IDS.login_password) as HTMLInputElement).value;

    DB.addUser(user, pw).then((resp) => {
      if (resp.ok) {

        this.setState({
          user: new TurtleCoder(user, pw)
        });

        alert(`Welcome! User '${user}' created.`);
        this.loadUserCurrentFile();
        this.closeLoginModal();
      }
    }).catch((reason: PouchDB.Core.Error) => {

      if (reason.reason === 'Document update conflict.') {
        alert(`Registration failure: a user with this name already exists.`);
      } else {
        alert(`Registration failure: 
        Reason: ${reason.reason}
        id: ${reason.id}
        message: ${reason.message}
        error: ${reason.error}
        name: ${reason.name}
        
        Please let me know that this happened!`);
      }

    });
  }

  evaluateFileForChanges = () => {
    if (this.state.openedFile) {

      this.setState({
        dirtyFile: this.state.openedFile.code !== this.getEditorCode()
      } as AppState);
    }
  }

  promptToCreateNewUser(user: string, pw: string) {
    alert(`No user with that name exists! Click 'Register' above to register this account.`);
  }

  loadUserData = (user: string, pw: string) => {
    return DB.getUser(user).then((userDoc: TurtleCoder) => {
      //      console.log('Got a user...');
      if (userDoc.pw !== pw) {
        alert(`Password incorrect. Please try agian.`);
      } else {
        this.setState({
          user: TurtleCoder.fromObject(userDoc)
        } as AppState);
        this.loadUserCurrentFile();
        this.closeLoginModal();
      }
    });
  }

  render() {
    let editorWidth: number = window.innerWidth / 2;
    let editorHeight: number = window.innerHeight;

    return (
      <div className="App">
        <LoginModal
          show={this.state.showLoginModal}
          onHide={this.closeLoginModal}
          login={this.login}
          register={this.registerNewUser}
        />
        <Modal
          show={this.state.showNewFileModal}
          onHide={() => {
            this.setState({
              showNewFileModal: false
            });
          }}
        >
          <Modal.Body>
            <FormGroup>
              <ControlLabel>
                New File Name:
              </ControlLabel>
              <FormControl
                type="text"
                id={HTML_IDS.new_filename}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" onClick={this.newFile}>Create File</button>
          </Modal.Footer>
        </Modal>

        <Navbar
          staticTop={true}
          style={{ marginBottom: '0px' }}
        >
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <Navbar.Header >
            <Navbar.Brand>
              Welcome to the RLN Programming Club!
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <Navbar.Form>
              <FileBrowser
                userList={this.state.userList}
                userFiles={this.state.userFiles}
                loadFile={(file) => { this.loadReadonlyFile(file); }}
              />
            </Navbar.Form>
          </Nav>
          <Nav pullRight={true}>
            <Navbar.Form>
              <NavItem>
                <Controls
                  playFunction={this.runEditorCode}
                  toggleGridFunction={TurtleCanvas.toggleGridVisibility}
                  toggleTurtlesFunction={TurtleCanvas.toggleTurtleVisibility}
                  saveCode={this.saveEditorCode}
                  copyCode={this.makeACopyOfEditorCode}
                  loginFunction={this.openLoginModal}
                  loadFile={this.loadFile}
                  newFile={this.newFileDialog}
                  readOnly={!this.state.editingMode}
                  user={this.state.user}
                  dirtyFile={this.state.dirtyFile}
                  forceUpdate={
                    () => {
                      this.loadUserCurrentFile();
                      this.forceUpdate();
                    }
                  }
                />
              </NavItem>
            </Navbar.Form>
          </Nav>
        </Navbar>

        <div id="EditorAndCanvas">
          <MonacoEditor
            width={editorWidth}
            height={editorHeight}
            language="typescript"
            theme="vs-dark"
            options={{
              codeLens: false,
              lineNumbersMinChars: 3,
              snippetSuggestions: 'none',
              wordBasedSuggestions: false,
              readOnly: !this.state.editingMode
            }}
            text-align="left"
            editorDidMount={this.handleEditorDidMount}
            // todo : check that this 'bind' statement is necessary
            // eslint-disable-next-line
            onChange={this.evaluateFileForChanges.bind(this)}
          />
          <TurtleCanvas
            width={editorWidth}
            height={editorHeight}
          >
            {
              (
                this.state.openedFile ?
                  <h3>
                    <Label>
                      {this.state.openedFile.authors[
                        this.state.openedFile.authors.length - 1
                      ]} / {this.state.openedFile.name}
                    </Label>
                  </h3>
                  :
                  ''
              )
            }

          </TurtleCanvas>

        </div>
      </div>
    );
  }
}

export default App;
