import * as React from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import { Play, Controls } from './components/Buttons';
import { LoginModal } from './components/Login';
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
  NavItem
} from 'react-bootstrap';
// import Student from './student';

const logo = require('./logo.svg');

export const enum HTML_IDS {
  login_username = 'loginField',
  login_password = 'passwordField',
  login_retype_password = 'retypePasswordField',
  new_filename = 'newFilenameField',
  appheader_file_browser = 'fileBrowser'
}

class AppState {
  showLoginModal: boolean;
  showNewFileModal: boolean;
  user?: TurtleCoder;
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
      throw new Error(`File not found in this user's data`);
    }
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

        <Navbar staticTop style={{ marginBottom: '0px' }}>
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <Navbar.Header >
            <Navbar.Brand>
              Welcome to the RLN Programming Club!
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <Navbar.Form>
              <SplitButton
                title='Browse our code!'
                id={HTML_IDS.appheader_file_browser}
              >
              </SplitButton>
            </Navbar.Form>
          </Nav>
          <Nav pullRight>
            <Navbar.Form>
              <NavItem>
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
            children={""}
          />
        </div>
      </div >
    );
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
      }
      else {
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

  private promptToCreateNewUser(user: string, pw: string) {
    alert(`No user with that name exists! Click 'Register' above to register this account.`);
  }

  private loadUserData(user: string, pw: string) {
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
}

export default App;
