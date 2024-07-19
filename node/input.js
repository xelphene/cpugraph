
'use strict';

const {Node} = require('./node');

class InputNode extends Node {
    constructor() {
        super();
        this._debugName = '[InputNode]';
    }
    
    set value (v) {
        this._value = v;
        this.sayChanged();
    }
    
    get value () {
        return this._value;
    }
}
exports.InputNode = InputNode;
