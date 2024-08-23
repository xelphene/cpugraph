
'use strict';

const {NodeValue}  =require('../consts');
const {Node} = require('./node');

class InputNode extends Node {
    constructor({debugName}) {
        super({debugName});
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
