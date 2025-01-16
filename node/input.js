
'use strict';

const {NODE} = require('../consts');
const {NodeValue} = require('./util');
const {Node} = require('./node');
const {getNodeValueProxy, getValueProxy} = require('./nvp');

class InputNode extends Node {
    constructor({universe, debugName, value}) {
        super({universe, debugName});
        //this._valueChangeListeners = new Set();
        //this._initChannel();
        if( value!==undefined )
            this._value = value;
    }
    
    set value (v) {
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        
        this._value = v;
        
        //this._say('ValueChanged');
        this._tellHandlesChanged();
    }
    
    get rawValue () {
        return this._value;
    }
    
    get value () {
        //return getNodeValueProxy(this);
        if( typeof(this._value) != 'object' )
            return getValueProxy( this, new NodeValue(this._value) );
        else
            return getValueProxy( this, this._value );
    }
    
    get settable () { return true }
}
exports.InputNode = InputNode;
