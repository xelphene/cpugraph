
'use strict';

const {NODE} = require('../consts');
const {hasNode, NodeValue} = require('./util');
const {Node} = require('./node');
const {getNodeValueProxy, getValueProxy} = require('./nvp');
const {mixinBlabSpeak} = require('../blab');

class MapNode extends Node {
    constructor({universe, debugName, mapper, srcNode}) {
        super({universe, debugName});
        this._initChannel();
        
        if( ! (srcNode instanceof Node) )
            throw new Error(`Node instance required for srcNode)`);
        this._srcNode = srcNode;
        this._srcNode.speakToMethod( 'NewValue', this, this.srcNodeChanged );
        
        this._mapper = mapper;
        this._computeCount = 0;
        this._fresh = false;
        this._value = null;
    }
    
    srcNodeChanged () {
        this._fresh = false;
        this._sayNewValue();
    }
    
    get mapping () { return this._mapping }
    
    mapperBindNodeChanged () {
        this._fresh = false;
        this._sayNewValue();
    }
    
    compute () {
        const v = this._mapper.fwdMap( this._srcNode.value );
        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);
        this._value = v;
        this._computeCount++;
        this._fresh = true;
    }
    
    get settable () {
        return this._mapper.reversible && this._srcNode.settable
    }
    
    set value (v) {
        if( ! this._srcNode.settable )
            throw new Error(`srcNode is not settable`);
        this._srcNode.value = this._mapper.revMap( v );
    }
    
    get rawValue () { 
        if( ! this._fresh )
            this.compute();
        return this._value;
    }
        
    get value () {
        if( this._computeCount==0 )
            return getNodeValueProxy( this );
        else
            return getValueProxy( this, this.rawValue );
    }
}
mixinBlabSpeak(MapNode,['NewValue']);
exports.MapNode = MapNode;
