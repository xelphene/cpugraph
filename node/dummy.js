
'use strict';

const {Node} = require('./node');
const {getNodeValueProxy, getValueProxy} = require('./nvp');
const {hasNode, NodeValue} = require('./util');
const {mixinBlabSpeak} = require('../blab');

class DummyNode extends Node {
    constructor({universe, get, set, debugName}) {
        super({universe, debugName});
        if( typeof(get) != 'function' )
            throw new Error(`function required for 'get' argument`);
        this._getFunc = get;
        this._setFunc = set;
        this._fresh = false;
        this._value = null;
        this._computedBefore = false;
    }
    
    get fresh () { return this._fresh }
    
    get settable () {
        return this._setFunc !== undefined;
    }
    
    set value (v) {
        if( ! this.settable )
            throw new Error(`Attempt to set unsettable DummyNode`);
        this._setFunc(v);
        this.spoil();
    }
    
    compute () {
        var v = this._getFunc();
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        this._value = v;
        this._computedBefore = true;
    }
    
    spoil () {
        if( ! this._fresh ) return;
        this._fresh = false;
        this._sayNewValue();
    }
    
    // should *only* be called from nodeValueProxyHandler
    get rawValue () { 
        if( ! this._fresh )
            this.compute();
        return this._value;
    }
        
    get value () {
        if( ! this._computedBefore )
            return getNodeValueProxy( this );
            
        if( ! this._fresh )
            this.compute();
        return getValueProxy( this, this.rawValue );
    }
    
}
mixinBlabSpeak(DummyNode, ['NewValue']);
exports.DummyNode = DummyNode;
