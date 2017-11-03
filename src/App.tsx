import * as React from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import { Play, Controls } from './components/Buttons';
import TurtleCanvas from './components/turtleCanvas';
import ProgramCompiler from './ProgramExecution';
import { DB, TurtleCoder } from './db';
import { FormControl, FormGroup, ControlLabel, Modal } from 'react-bootstrap';
// import Student from './student';

const logo = require('./logo.svg');

const HTML_IDS = {
  login_username: 'loginField',
  login_password: 'passwordField',
  new_filename: 'newFilenameField'
};

class AppState {
  showLoginModal: boolean;
  showNewFileModal: boolean;
  user?: TurtleCoder;
}

class App extends React.Component {
  editor: monaco.editor.ICodeEditor;
  loginModalVisible: boolean = false;

  state: AppState

  constructor() {
    super();
    this.state = {
      showNewFileModal: false,
      showLoginModal: false,
      user: undefined
    };
  }

  componentDidMount() {
    // DB.Instance();
  }

  handleEditorDidMount = (editor: {}) => {
    this.editor = editor as monaco.editor.ICodeEditor;
    // this.login();
    this.loadUserCurrentFile();
  }

  loadUserCurrentFile = () => {

    if (this.state.user) {
      let newCode = this.state.user.getCurrentFile();
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
      this.editor.setValue(this.state.user.getCurrentFile().code);
      this.forceUpdate();
    } else {
      throw new Error("File not found in this user's data");
    }
  }

  newFileDialog = () => {
    if (this.state.user) {
      this.setState({
        showNewFileModal: true
      } as AppState)
    } else {
      throw new Error("Must be logged in to create a file");
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

    this.loadUserData(user).catch((reason) => {
      // reason.reason === 'missing'
      this.promptToCreateNewUser(user, pw);
    })
  }

  saveEditorCode = () => {
    if (this.state.user) {

      let ts = this.editor.getValue();

      DB.saveCode(
        this.state.user.name,
        {
          name: this.state.user.currentFile,
          code: ts,
          authors: new Set(this.state.user.name)
        }
      ).then(() => {
        if (this.state.user)
          this.loadUserData(this.state.user.name);
      });

    } else {
      alert('You must be logged in to save code.');
    }
  }

  runEditorCode = () => {
    this.clearTurtleCanvas();
    let ts = this.editor.getValue();
    let js = new ProgramCompiler(ts).getJS();

    // alert(js);
    eval(js);
    // new ProgramRunner(this.getEditorCode());
  }
  clearTurtleCanvas = () => {
    let cvs = document.getElementById('turtleCanvas') as HTMLCanvasElement;
    let ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
  }

  getEditorCode = () => {
    return this.editor.getValue();
  }

  render() {
    let editorWidth: number = window.innerWidth / 2;
    let editorHeight: number = window.innerHeight;

    return (
      <div className="App">
        <Modal
          show={this.state.showLoginModal}
          onHide={this.closeLoginModal}
          onShow={() => {
            (document.getElementById(HTML_IDS.login_username) as HTMLElement).focus();
          }}
        >
          <Modal.Body>
            <FormGroup>
              <ControlLabel >Username: </ControlLabel>
              <FormControl
                id={HTML_IDS.login_username}
                type="text" />
              <ControlLabel >Password: </ControlLabel>
              <FormControl
                id={HTML_IDS.login_password}
                type="password" />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-primary' onClick={this.login}>Log In</button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.showNewFileModal}
          onHide={() => {
            this.setState({
              showNewFileModal: false
            })
          }}>
          <Modal.Body>
            <FormGroup>
              <ControlLabel>
                New File Name:
              </ControlLabel>
              <FormControl
                type='text'
                id={HTML_IDS.new_filename}
              >
              </FormControl>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-primary' onClick={this.newFile}>Create File</button>
          </Modal.Footer>
        </Modal>

        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>Welcome to the RLN Programming Club!</h2>
          <Controls
            playFunction={this.runEditorCode}
            toggleGridFunction={TurtleCanvas.toggleGridVisibility}
            toggleTurtlesFunction={TurtleCanvas.toggleTurtleVisibility}
            saveCode={this.saveEditorCode}
            loginFunction={this.openLoginModal}
            loadFile={this.loadFile}
            newFile={this.newFileDialog}
            user={this.state.user}
          />
        </div>
        <div id="EditorAndCanvas">
          <MonacoEditor
            width={editorWidth}
            height={editorHeight}
            language="typescript"
            theme="vs-dark"
            options={{
              codeLens: false,
              lineNumbersMinChars: 3,
              /* minimap: { enabled: false }, */
              /* showFoldingControls: "always", */
              snippetSuggestions: 'none',
              wordBasedSuggestions: false
            }}
            text-align="left"
            editorDidMount={this.handleEditorDidMount}
          />
          <TurtleCanvas
            width={editorWidth}
            height={editorHeight}
          />
        </div>
      </div>
    );
  }

  private promptToCreateNewUser(user: string, pw: string) {
    var confirm: string;
    do {
      confirm = prompt(`Retype the password to create an account called: ${user}`) as string;
    } while (pw !== confirm);

    DB.addUser(user, pw).then((resp) => {
      if (resp.ok) {

        this.setState({
          user: new TurtleCoder(user, pw)
        });

        alert(`Welcome! User '${user}' created.`);
        this.loadUserCurrentFile();
        this.closeLoginModal();

      }
    }).catch((reason) => {
      console.log('Registration failure: ');
      console.log(reason.reason);
    });
  }

  private loadUserData(user: string) {
    return DB.getUser(user).then((userDoc: TurtleCoder) => {
      //      console.log('Got a user...');
      this.setState({
        user: TurtleCoder.fromObject(userDoc)
      } as AppState);
      this.loadUserCurrentFile();
      this.closeLoginModal();
    });
  }
}

export default App;
