
'use strict';

const {NODE, DEBUG} = require('../consts');
const {nodeOf, isNode, hasNode, NodeValue, isHandle, handleOf} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');
const {mixinBlabListen} = require('../blab');

class StretchNode extends Node {
    constructor({max, debugName}) {
        super({debugName});
        this._initChannel();

        if( max!==undefined ) {
            if( isNode(max) )
                this._maxHandle = max.handle;
            else if( isHandle(max) )
                this._maxHandle = max
            else
                throw new Error(`Node or NodeHandle instance or undefined required for max argument`);
            this._maxHandle = handleOf(max);
            
            this._listenToForAny(this._maxHandle, ['ValueChanged','ValueSpoiled'], this.depStateChanged);
        } else
            this._maxHandle = null;
        
        this._value = null;
        this._computeCount = 0;
    }
    
    get settable () { return true }
    get fresh () { return true }
    get computeCount () { return this._computeCount }

    get maxHandle () { return this._maxHandle }
    get maxNode   () { return this._maxHandle.node }
    set maxNode (maxNode) {
        if( this._maxHandle !== null )
            throw new Error(`maxNode already set`);
        if( ! isNode(maxNode) )
            throw new Error(`Node instance required for maxNode argument`);
        this._maxHandle = maxNode.handle;
        
        //this.listenTo(maxNode);

        this._listenToForAny(this._maxHandle, ['ValueChanged','ValueSpoiled'], this.depStateChanged);
    }

    depStateChanged(node) {
        //this._sayValueSpoiled();
        this._tellHandlesSpoiled();
    }
    
    set value (v) {
        if( typeof(v) !== 'number' )
            throw new TypeError('number type required for StrechNode assigned value');
        
        if( this._maxHandle!==null && v > this._maxHandle.rawValue )
            throw new Error(`Out of bounds value ${v}: max is ${this._maxHandle.rawValue}`);
        this._value = new NodeValue(this, v);
        //this._sayValueChanged();
        this._tellHandlesChanged();
    }
    
    get rawValue () {
        if( this._value===null )
            throw new Error(`Cannot compute the value of a StrechNode before it has been assigned a value.`);

        if( this._maxHandle===null ) {
            return this._value;
        } else {
            if( this._value <= this._maxHandle.rawValue )
                return this._value
            else
                return this._maxHandle.rawValue;
        }
    }
    
    get value () {
        return getNodeValueProxy( this );
    }

}
mixinBlabListen(StretchNode);
exports.StretchNode = StretchNode;
