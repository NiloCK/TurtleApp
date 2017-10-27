import * as pouch from 'pouchdb-browser';
// const pouch = require('pouchdb-browser');

class TurtleCode {
    private users: Array<TurtleCoder>;
}
class TurtleCoder {
    private name: string;
    // the user's extension of the turtle class - one per user
    private extendedTurtle: string;
    // user defined fcns
    private words: Array<string>;

    // individual scenes. drawn w/ access to the user's
    // extendedTurtle and word bank
    private scenes: Array<string>;
}

export default class DB {
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

    public static getUsers(): Promise<string> {
        return DB.Instance().remoteDB.get('users');
        // return this.localDB.get('users');
    }

    public getCode(): Promise<string> {
        // let ret: string;
        return this.remoteDB.get('code');
    }
    // public static getUserCode(user: string): Promise<string> {
    //     return this.Instance().localDB.get(user);
    // }
    public static addUser(userName: string, password: string) {
        this.Instance().remoteDB.get('users').then((doc) => {
            doc['users'][userName] = password;
            return this.Instance().remoteDB.put(doc);
        }).catch((reason) => {
            console.log('Registration failure: ');
            console.log(reason);
        }).then((resp: PouchDB.Core.Response) => {
            if (resp.ok) {
                alert(`Welcome! User '${userName}' created.`);
            }
        });
    }

    public saveCode(user: string, ts: string) {
        this.remoteDB.get('code').then((doc) => {
            // 'currentUser' here instead of MrK
            doc[user] = ts;
            return this.localDB.put(doc);
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