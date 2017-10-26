import * as React from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import { Play, Controls } from './components/Buttons';
import TurtleCanvas from './components/turtleCanvas';
import ProgramCompiler from './ProgramExecution';
import DB from './db';
// import Student from './student';

const logo = require('./logo.svg');

class App extends React.Component {
  currentUser: string = 'MrK';
  editor: monaco.editor.ICodeEditor;


  handleEditorDidMount = (editor: {}) => {
    this.editor = editor as monaco.editor.ICodeEditor;
    // this.login();
    this.loadUserCode();
  }

  loadUserCode = () => {

    // load code from db
    DB.Instance().getCode().then((code) => {
      this.editor.setValue(code[this.currentUser]);
    });
  }

  login = () => {
    let user: string = prompt("Username:") as string;
    let pw: string = prompt("Password: ") as string;

    DB.getUsers().then((users) => {
      if (users[user] === pw) {
        alert('yay');
        this.currentUser = user;
        this.loadUserCode();
      } else {
        alert('Username / pw incorrect');
      }
    })
  }
  saveEditorCode = () => {
    let ts = this.editor.getValue();
    DB.Instance().saveCode(this.currentUser, ts);
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
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>Welcome to the RLN Programming Club!</h2>
          <Controls
            playFunction={this.runEditorCode}
            toggleGridFunction={TurtleCanvas.toggleGridVisibility}
            toggleTurtlesFunction={TurtleCanvas.toggleTurtleVisibility}
            saveCode={this.saveEditorCode}
          />
        </div>
        <div id="EditorAndCanvas">
          <MonacoEditor
            width={editorWidth}
            height={editorHeight}
            language="typescript"
            theme="vs-dark"
            value={
              `// Type your code in here.

let tom = new Turtle();

`}
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
}

export default App;
