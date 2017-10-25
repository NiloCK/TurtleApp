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

