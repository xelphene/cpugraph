
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
    
    setValue (v, opts) {
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        
        this._value = v;
        
        this._sayNewValue();
        
        if( opts.checkConstraints ) {
            if( this._universe === undefined )
                throw new Error('Universe needed for checkConstraints')

            this._universe.checkConstraints();
        }
    }
    
    set value (n) {
        this.setValue(n, {checkConstraints:true})
    }
    
    get rawValue () {
        this.checkConstraints();
        return this._value;
    }

    get constraintCheckValue () {
        return this._value;
    }
    
    get value () {
        //return getNodeValueProxy(this);
        if( typeof(this._value) != 'object' )
            return getValueProxy( this, new NodeValue(this, this.rawValue) );
        else
            return getValueProxy( this, this.rawValue );
    }
    
    get settable () { return true }
        
}
mixinBlabSpeak(InputNode,['NewValue']);
exports.InputNode = InputNode;
