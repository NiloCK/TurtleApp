let TurtleJS: string;

let client = new XMLHttpRequest();
client.open('GET', './turtle/turtle.js');
client.onreadystatechange = function () {
    TurtleJS = client.responseText;
    TurtleJS += "\nlet Tom = new Turtle();"
};
client.send();

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

    private compileWorker(program: string): Worker {
        const progBlob = new Blob([TurtleJS, program], { type: 'text/javascript' });
        const progURL = URL.createObjectURL(progBlob);

        const worker = new Worker(progURL);
        URL.revokeObjectURL(progURL);
        return worker;
    }

    terminate(reason: string) {
        this.worker.terminate();
    }

    start(): void {

    }
}

export default ProgramExecution;