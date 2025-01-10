
'use strict';

const {NODE} = require('../consts');
const {NodeValue} = require('./util');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');

class InputNode extends Node {
    constructor({universe, debugName, value}) {
        super({universe, debugName});
        if( value!==undefined )
            this.value = value;
    }
    
    set value (v) {
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        
        this._value = v;
        
        this.sayChanged();
    }
    
    get rawValue () {
        return this._value;
    }
    
    get value () {
        return getNodeValueProxy(this);
    }
    
    get settable () { return true }
}
exports.InputNode = InputNode;
