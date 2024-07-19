
'use strict';

const {NodeValue}  =require('../consts');
const {Node} = require('./node');

class InputNode extends Node {
    constructor() {
        super();
        this._debugName = '[InputNode]';
    }
    
    set value (v) {
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        else
            v[NODE] = this;
        
        this._value = v;
        
        this.sayChanged();
    }
    
    get value () {
        return this._value;
    }
}
exports.InputNode = InputNode;
