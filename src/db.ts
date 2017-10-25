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

    public writeTurtle(ts: string) {
        this.localDB.put({
            _id: new Date().toJSON(),
            ts: ts
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