import * as React from 'react';
import './App.css';
import * as Modal from 'react-modal';
import MonacoEditor from 'react-monaco-editor';
import { Play, Controls } from './components/Buttons';
import TurtleCanvas from './components/turtleCanvas';
import ProgramCompiler from './ProgramExecution';
import { DB, TurtleCoder } from './db';
// import Student from './student';

const logo = require('./logo.svg');

const HTML_IDS = {
  login_username: 'loginField',
  login_password: 'passwordField'
};

class AppState {
  showLoginModal: boolean;
  user?: TurtleCoder;
}

class App extends React.Component {
  editor: monaco.editor.ICodeEditor;
  loginModalVisible: boolean = false;

  state: AppState

  constructor() {
    super();
    this.state = {
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
    this.loadUserCode();
  }

  loadUserCode = () => {

    // load code from db
    if (this.state.user) {
      let newCode = this.state.user.getCurrentFile();
      this.editor.setValue(newCode.code);
    } else {
      this.editor.setValue(
        `// Type your code here! Log in / register to save your work
      
let tom = new Turtle();`);
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

    DB.getUser(user).then((userDoc: TurtleCoder) => {

      //      console.log('Got a user...');
      this.setState({
        user: TurtleCoder.fromObject(userDoc)
      } as AppState);
      this.loadUserCode();
      this.closeLoginModal();
    }).catch((reason) => {
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
      );
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
          isOpen={this.state.showLoginModal}
          contentLabel="Login / Registration"
        >
          <div>
            <label >Username: </label>
            <input id={HTML_IDS.login_username} type="text" />
            <label >Password: </label>
            <input id={HTML_IDS.login_password} type="password" />
            <button onClick={this.login}>Log In</button>
          </div>
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
        this.loadUserCode();
        this.closeLoginModal();

      }
    }).catch((reason) => {
      console.log('Registration failure: ');
      console.log(reason.reason);
    });
  }
}

export default App;
