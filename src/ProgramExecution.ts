import * as TS from 'typescript';

let TurtleTS: string;
let TurtleJS: string;

let client = new XMLHttpRequest();
client.open('GET', './turtle/turtle.ts');
client.onreadystatechange = function () {
    TurtleTS = client.responseText;
};
client.send();

client = new XMLHttpRequest();
client.open('GET', './turtle/turtle.js');
client.onreadystatechange = function () {
    TurtleJS = client.responseText;
};
client.send();

/**
 * A utility for transpiling user-created Typescript into
 * executable Javascript
 */
class ProgramCompiler {
    userTS: string;

    constructor(userTS: string) {
        this.userTS = userTS;
    }
    getJS(): string {
        return TS.transpile(this.userTS);
    }
}

class ProgramExecution {
    static running: false;
    worker: Worker;

    constructor(program: string) {
        this.worker = this.compileWorker(program);
        this.worker.onerror = (e) => {
            alert('There was an error...' + e.message);
            this.terminate('onerror');
        };
    }

    terminate(reason: string) {
        this.worker.terminate();
    }

    // start(): void {
    // }

    private compileWorker(program: string): Worker {
        const progBlob = new Blob([TurtleJS, program], { type: 'text/javascript' });
        const progURL = URL.createObjectURL(progBlob);

        const worker = new Worker(progURL);
        URL.revokeObjectURL(progURL);
        return worker;
    }

}

export default ProgramCompiler;