
'use strict';

const {NODE} = require('../consts');
const {NodeValue} = require('./util');
const {Node} = require('./node');
const {getNodeValueProxy, getValueProxy} = require('./nvp');
const {mixinBlabSpeak} = require('../blab');

class InputNode extends Node {
    constructor({universe, debugName, value}) {
        super({universe, debugName});
        //this._valueChangeListeners = new Set();
        this._initChannel();
        if( value!==undefined )
            this._value = value;
    }
    
    set value (v) {
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        
        this._value = v;
        
        //this._sayValueChanged();
        this._say('ValueChanged');
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
    
    /*
    _sayValueChanged() {
        for( let l of this._valueChangeListeners ) {
            if( l(this) === false )
                this._valueChangeListeners.delete(l);
        }
    }
    
    onValueChange (f) {
        this._valueChangeListeners.add(f)
    }
    
    onStateChange (f) { this.onValueChange(f) }
    */
}
mixinBlabSpeak(InputNode,['ValueChanged']);
exports.InputNode = InputNode;
