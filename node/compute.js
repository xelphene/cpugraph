
'use strict';

const {NODE, DEBUG} = require('../consts');
const {hasNode, NodeValue} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');
const {mixinBlabFull} = require('../blab');

class ComputeNode extends Node {
    constructor({universe, func, bind, bindThis, debugName}) {
        super({universe, debugName});
        
        this._initChannel();
        
        if( typeof(func) != 'function' )
            throw new TypeError(`function required for func`);
        this._computeFunc = func;

        if( bind===undefined )
            bind=[];
        for( let i=0; i<bind.length; i++ ) {
            if( typeof( bind[i] ) != 'object' )
                throw new TypeError(`object required for binding ${i}`);
        }
        this._bindings = bind;
        if( bindThis===undefined )
            this._bindThis=null;
        else
            this._bindThis=bindThis;
        this._dependsOn = new Set();
        
        //this._spoilListeners = new Set();
        
        this._computeCount = 0;
        this._value = null;
        this._fresh = false;
    }

    get settable () { return false }

    get fresh () { return this._fresh }
    get computeCount () { return this._computeCount }
    
    log(msg) {
        if( DEBUG )
            console.log(`${this.debugName}: ${msg}`);
    }
    
    // only called from DTProxyHandler and ComputeNode.compute()
    dependOn(otherNode) {
        this.log(`heard I depend on ${otherNode.debugName}`);
        this._dependsOn.add(otherNode);
        
        /*
        const cb = changedNode => {
            if( cb.rv )
                this.depStateChanged();
            return cb.rv
        }
        cb.rv = true;
            
        otherNode.onStateChange( cb );
        */
        
        //this._listenTo(otherNode, 'stateChanged', this.depStateChanged);
        if( otherNode.says('ValueSpoiled') )
            this._listenTo(otherNode, 'ValueSpoiled', this.depStateChanged);
        else if( otherNode.says('ValueChanged') )
            this._listenTo(otherNode, 'ValueChanged', this.depStateChanged);
        else
            throw new Error(`Node ${otherNode} says neither ValueSpoiled nor ValueChanged`);
    }
    
    /*
    _unlisten () {
        for( let l of this._dependsOn )
            l.rv = false;
        this._dependsOn = new Set();
    }
    */
    
    depStateChanged (node) {
        this.log(`heard my dep ${node} state changed`);
        this._fresh = false;
        //this._saySpoiled();
        this._say('ValueSpoiled');
    }
    
    /*
    _saySpoiled () {
        for( let l of this._spoilListeners )
            if( l(this) === false )
                this._spoilListeners.delete(l);
    }
    */

    get depsDebugNames () {
        return [...this._dependsOn].map( n => n.debugName );
    }
    
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( hasNode(b) ) {
                this.dependOn(b[NODE]);
                rv.push( b );
            } else if( b instanceof Node ) {
                this.dependOn(b);
                rv.push( b.value );
            } else {
                rv.push( new Proxy(b, new DTProxyHandler(this) ));
            }
        }
        
        if( this._bindThis===null )
            var thisArg = null;
        else {
            var thisArg = new Proxy(this._bindThis, new DTProxyHandler(this) );
        }
        
        return [thisArg, rv];
    }
    
    compute() {
        this.log(`recomputing`);
        this._value = null;
        this._fresh = false;
        // TODO: staticDeps option for optimization
        this._unlistenAll();
        let [thisArg, args] = this._getArgs();
        //this.log(`call with ${args}`);
        let v = this._computeFunc.apply(thisArg, args);
        //this.log(`result ${v}`);

        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);

        this._computeCount++;
        this._value = v;
        this._fresh = true;
        this._say('ValueChanged');
    }

    // should *only* be called from nodeValueProxyHandler
    get rawValue () { 
        if( ! this._fresh )
            this.compute();
        return this._value;
    }
        
    get value () {
        //if( ! this._fresh )
        //    this.compute();
        return getNodeValueProxy( this );
    }
}
mixinBlabFull(ComputeNode, ['ValueSpoiled','ValueChanged']);
exports.ComputeNode = ComputeNode;
