
'use strict';

const {NODE, DEBUG} = require('../consts');
const {nodeOf, isNode, hasNode, NodeValue} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');

class StretchNode extends Node {
    constructor({maxNode, debugName}) {
        super({debugName});

        if( maxNode!==undefined ) {
            if( ! isNode(maxNode) )
                throw new Error(`Node instance or undefined required for maxNode argument`);
            maxNode = nodeOf(maxNode);
            this._maxNode = maxNode;
            this.listenTo(maxNode);
        } else
            this._maxNode = null;
        
        this._value = null;
        this._computeCount = 0;
    }
    
    get settable () { return true }
    get fresh () { return true }
    get computeCount () { return this._computeCount }

    get maxNode () { return this._maxNode }
    set maxNode (maxNode) {
        if( this._maxNode !== null )
            throw new Error(`maxNode already set`);
        if( ! isNode(maxNode) )
            throw new Error(`Node instance required for maxNode argument`);
        maxNode = nodeOf(maxNode);
        this._maxNode = maxNode;
        this.listenTo(maxNode);
    }

    // called exclusively from Channel when our maxNode changed
    hearSpoiled(speakingNode) {
        this.saySpoiled();
    }

    // called exclusively from Channel when our maxNode changed
    hearChanged(speakingNode) {
        this.saySpoiled();
    }
    
    set value (v) {
        if( typeof(v) !== 'number' )
            throw new TypeError('number type required for StrechNode assigned value');
        
        if( this._maxNode!==null && v > this._maxNode.rawValue )
            throw new Error(`Out of bounds value ${v}: max is ${this._maxNode.rawValue}`);
        this._value = new NodeValue(this, v);
        this.sayChanged();
        
    }
    
    get rawValue () {
        if( this._value===null )
            throw new Error(`Cannot compute the value of a StrechNode before it has been assigned a value.`);
        
        if( this._maxNode!==null && this._value <= this._maxNode.rawValue )
            return this._value;
        else
            return this._maxNode.rawValue;
    }
    
    get value () {
        return getNodeValueProxy( this );
    }

}
exports.StretchNode = StretchNode;
