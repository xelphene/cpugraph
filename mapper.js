
'use strict';

const {Node} = require('./node/node');
const {MapNode} = require('./node/map');

class Mapper {
    constructor({ universe, fwdMapFunc, revMapFunc, bind }) {
        if( universe===undefined )
            throw new Error(`universe was not provided to Mapper constructor`);
                
        if( typeof(fwdMapFunc) != 'function' )
            throw new Error('function required for fwdMapFunc');
        this._fwdMapFunc = fwdMapFunc

        if( revMapFunc===undefined )
            this._revMapFunc=null;
        else if( typeof(revMapFunc) == 'function' )
            this._revMapFunc = revMapFunc;
        else
            throw new Error('function or null required for revMapFunc');
        
        this._universe = universe;        
        this._mapNodes = new Set();
        this._srcNodeToMapNode = new Map();

        if( bind===undefined )
            bind=[];
        for( let i=0; i<bind.length; i++ )
        {
            if( ! (bind[i] instanceof Node) )
                throw new Error(`Node instance required for bind ${i}, not ${typeof(bind[i])}`);
            
            bind[i].onNewValue( () => this._bindNodeChanged() );
        }
        this._bind = bind;
    }
    
    get mode () {
        if( this._revMapFunc===null )
            return 'fwd';
        else {
            if( this._fwdMapFunc===this._revMapFunc )
                return 'sym'
            else
                return 'split'
        }
    }
    
    matches(fwdMapFunc, revMapFunc, bindNodes) {
        if( this._fwdMapFunc !== fwdMapFunc )
            return false;
        if( this._revMapFunc !== revMapFunc )
            return false;

        if( this._bind.length != bindNodes.length )
            return false;
        
        for( let i=0; i<this._bind.length; i++ )
            if( this._bind[i] !== bindNodes[i] )
                return false;
        
        return true;
    }
    
    fwdMap (value) {
        const args = this._bind.map( node => node.value )
            .concat(value);
        return this._fwdMapFunc.apply(null, args);
    }

    revMap (value) {
        const args = this._bind.map( node => node.value )
            .concat(value);
        return this._revMapFunc.apply(null, args);
    }
    
    get reversible () {
        return this._revMapFunc !== null;
    }
    
    _bindNodeChanged () {
        for( let mn of this._mapNodes )
            mn.mapperBindNodeChanged();
    }

    hasMapForSrc( srcNode ) {
        return this._srcNodeToMapNode.has(srcNode)
    }
    
    existingMapNode( srcNode ) {
        if( ! this._srcNodeToMapNode.has(srcNode) )
            throw new Error(`No MapNode available with the given srcNode`);
        return this._srcNodeToMapNode.get(srcNode)
    }
    
    mapNode( srcNode ) {
        if( this._srcNodeToMapNode.has(srcNode) )
            return this._srcNodeToMapNode.get(srcNode)
        
        const mn = new MapNode({
            universe: this._universe,
            mapper: this,
            srcNode
        });
        this._mapNodes.add(mn);
        this._srcNodeToMapNode.set(srcNode, mn);
        return mn;
    }
}
exports.Mapper = Mapper;
