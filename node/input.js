
'use strict';

const {NODE} = require('../consts');
const {NodeValue} = require('./util');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');
const {mixinChannelSpeak} = require('../channel');

class InputNode extends Node {
    constructor({universe, debugName, value}) {
        super({universe, debugName});
        //this._valueChangeListeners = new Set();
        this._initChannel();
        if( value!==undefined )
            this.value = value;
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
        return getNodeValueProxy(this);
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
mixinChannelSpeak(InputNode,['ValueChanged']);
exports.InputNode = InputNode;
