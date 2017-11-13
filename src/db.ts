import * as pouch from 'pouchdb-browser';
// const pouch = require('pouchdb-browser');

export class TurtleCodeFile {
    name: string;
    code: string;
    authors: Array<string>;

    static addAuthor(codeFile: TurtleCodeFile, author: string) {
        if (codeFile.authors.indexOf(author) === -1) {
            codeFile.authors.push(author);
            // codeFile.authors.sort();
        }
    }

    static fromObject(data: any): TurtleCodeFile {
        let ret = new TurtleCodeFile(
            data.name,
            data.code
        );

        data.authors.forEach((author: string) => {
            TurtleCodeFile.addAuthor(ret, author)
        })

        return ret;
    }

    constructor(name: string, code: string, author?: string) {
        this.name = name;
        this.code = code;
        this.authors = new Array<string>();
        if (author) {
            this.authors.push(author);
        }
    }

}

// todo: Make an authorlist class that's amenable to JSON serialization

export class AuthorList {
    authors: Array<string>;

    constructor() {
        this.authors = new Array<string>();
    }

    addAuthor(name: string) {
        if (this.authors.indexOf(name) === -1) {
            this.authors.push(name);
            this.authors.sort();
        }
    }

    toJSON() {
        return JSON.stringify(this.authors);
    }
}

export class TurtleCoder {
    name: string;
    pw: string;
    code: {
        [index: string]: TurtleCodeFile;
    };
    currentFile: string;

    static fromObject(data: any): TurtleCoder {
        let ret = new TurtleCoder(data.name, data.pw);
        ret.currentFile = data.currentFile;
        // ret.code = data.code;
        Object.keys(data.code).forEach((file: any) => {
            let codeFile = new TurtleCodeFile(
                data.code[file].name,
                data.code[file].code
            );
            data.code[file].authors.forEach((author: string) => {
                TurtleCodeFile.addAuthor(codeFile, author);
            });

            ret.code[file] = codeFile;
        });

        return ret;
    }

    deleteFile(fileName: string) {
        delete this.code[fileName];
        if (this.currentFile === fileName) {
            this.resetCurrentFile();
        }
    }

    resetCurrentFile() {
        if (this.getFileNames().length > 0) {
            this.currentFile = this.getFileNames()[0];
        } else {
            this.currentFile = "";
        }
    }

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

    /**
     * Adds a new file to the user's code book
     */
    newFile(newFileName?: string): TurtleCodeFile {
        var fileName: string = newFileName || generateName(this.getFileNames());

        function generateName(currentNames: Array<string>): string {
            let generatedName: string = 'newFile';
            let suffix: number = 1;

            while (currentNames.indexOf(generatedName) >= 0) {
                generatedName = 'newFile' + suffix;
                suffix++;
            }
            return generatedName;
        }

        let codeFile = new TurtleCodeFile(
            fileName,
            `// ${fileName}`,
            this.name
        );
        this.code[fileName] = codeFile;

        return codeFile;
    }

    getFileNames(): Array<string> {
        return Object.keys(this.code);
    }

    getCurrentFile(): TurtleCodeFile {
        if (this.currentFile && this.currentFile !== "") {
            return this.code[this.currentFile];
        } else {
            let file: TurtleCodeFile = this.newFile();
            this.currentFile = file.name;

            return file;
        }
    }
}

export class DB {
    private static instance: DB;

    private localDB: PouchDB.Database;
    private remoteDB: PouchDB.Database;

    public static getUser(username: string): Promise<TurtleCoder> {
        return DB.Instance().remoteDB.get(username);
    }

    public static updateUserData(user: TurtleCoder) {
        DB.getUser(user.name).then((userDoc) => {
            user["_rev"] = userDoc["_rev"];
            user["_id"] = user.name // ie, userDoc["_id"]

            DB.Instance().remoteDB.put(user).catch((reason) => {
                alert(reason);
            });
        }).catch((reason) => {
            alert(reason);
        });
    }

    public static addUser(userName: string, password: string): Promise<PouchDB.Core.Response> {
        let user = {
            _id: userName,
            name: userName,
            pw: password,
            code: {},
            currentFile: ''
        };

        return this.Instance().remoteDB.put(user);
    }

    public static getListOfUsernames(): Promise<PouchDB.Core.AllDocsResponse<{}>> {
        return this.Instance().remoteDB.allDocs();
    }

    public static saveCode(user: string, code: TurtleCodeFile): Promise<void> {
        return DB.Instance().remoteDB.get(user).then((userDoc) => {
            userDoc['code'][code.name] = code;
            userDoc['currentFile'] = code.name;
            return DB.Instance().remoteDB.put(userDoc);
        }).catch((reason) => {
            alert(`Save Failure: ${reason.reason}`);
        }).then((resp: PouchDB.Core.Response) => {
            if (resp.ok) {
                // alert('Saved!');
            }
        });
    }

    private static Instance(): DB {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new this();
            return this.instance;
        }
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