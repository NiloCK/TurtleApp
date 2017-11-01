import * as pouch from 'pouchdb-browser';
// const pouch = require('pouchdb-browser');

export class TurtleCoder {
    name: string;
    pw: string;
    code: {
        [index: string]: string;
    }
    currentFile: string;

    constructor(name: string, pw: string) {
        this.name = name;
        this.pw = pw;
        this.code = {};
        this.currentFile = '';
    }

    toObject(): object {
        return {
            name: this.name,
            pw: this.pw,
            code: this.code,
            currentFile: this.currentFile
        };
    }

    static fromObject(data: any): TurtleCoder {
        let ret = new TurtleCoder(data.name, data.pw);
        ret.currentFile = data.currentFile;
        ret.code = data.code;
        return ret;
    }

    getCurrentFileContents(): string {
        if (this.currentFile) {
            return this.code[this.currentFile];
        } else {
            this.currentFile = 'newFile';
            return `// Type your code here! Make sure to save your work as you go!
            
let ${this.name.replace(' ', '')} = new Turtle();`
        }
    }
}

export class DB {
    private static instance: DB;

    private localDB: PouchDB.Database;
    private remoteDB: PouchDB.Database;

    public static Instance(): DB {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new this();
            return this.instance;
        }
    }

    public static getUser(username: string): Promise<TurtleCoder> {
        return DB.Instance().remoteDB.get(username);
    }

    public static getUsers(): Promise<string> {
        return DB.Instance().localDB.get('users');
        // return this.localDB.get('users');
    }

    public getCode(): Promise<string> {
        // let ret: string;
        return this.localDB.get('code');
    }
    // public static getUserCode(user: string): Promise<string> {
    //     return this.Instance().localDB.get(user);
    // }
    public static addUser(userName: string, password: string): Promise<PouchDB.Core.Response> {
        let user = {
            _id: userName,
            name: userName,
            pw: password,
            code: {},
            currentFile: ''
        };

        return this.Instance().remoteDB.put(user);

        // .then((resp: PouchDB.Core.Response) => {
        //     if (resp.ok) {
        //         alert(`Welcome! User '${userName}' created.`);
        //     }
        // }).catch((reason) => {
        //     console.log('Registration failure: ');
        //     console.log(reason.reason);
        // });

        // this.Instance().localDB.get('users').then((doc) => {
        //     doc['users'][userName] = password;
        //     return this.Instance().localDB.put(doc);
        // }).catch((reason) => {
        //     console.log('Registration failure: ');
        //     console.log(reason);
        // }).then((resp: PouchDB.Core.Response) => {
        //     if (resp.ok) {
        //         alert(`Welcome! User '${userName}' created.`);
        //     }
        // });
    }

    public static saveCode(user: string, fileName: string, ts: string) {
        DB.Instance().remoteDB.get(user).then((userDoc) => {
            // 'currentUser' here instead of MrK
            userDoc['code'][fileName] = ts;
            return DB.Instance().remoteDB.put(userDoc);
        }).catch((reason) => {
            console.log('Save Failure: ');
            console.log(reason);
        }).then((resp: PouchDB.Core.Response) => {
            if (resp.ok) {
                alert('Saved!');
            }
        });
    }

    private constructor() {
        this.localDB = new pouch('rlnpc');
        this.remoteDB = new pouch(
            'https://nilock.cloudant.com/rlnpc',
            {
                skip_setup: true
            }
        );

        this.localDB.sync(this.remoteDB, {
            live: true,
            retry: true
        });
    }
}