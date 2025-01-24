
'use strict';

const {NODE, DEBUG} = require('../consts');
const {isNode, hasNode, NodeValue} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy, getValueProxy} = require('./nvp');
const {mixinBlabSpeak} = require('../blab');
const {isNodeObj} = require('../tree/nodeobj');

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
            if( ! isNode(bind[i]) && ! isNodeObj(bind[i]) ) {
                throw new Error(`bind[${i}] is neither a Node nor a NodeObj`);
            }
            //if( typeof( bind[i] ) != 'object' )
            //    throw new TypeError(`object required for binding ${i}`);
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
        
        //otherNode.onNewValue( () => this.depStateChanged() );
        otherNode.speakToMethod( 'NewValue', this, this.depStateChanged );
    }
    
    depStateChanged (node) {
        this.log(`heard my dep ${node.debugName} state changed`);
        this._fresh = false;
        this._sayNewValue();
    }
    
    get deps () { return this._dependsOn }
    
    spoil () {
        this._fresh = false;
        this._sayNewValue();
    }

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
    
    _unlistenDeps () {
        for( let dn in this._dependsOn ) {
            dn.stopSpeakingToMethod( 'NewValue', this );
            this._dependsOn.delete(dn);
        }
    }
    
    compute() {
        this.log(`COMPUTE ${this.debugName} ${this._computeCount}`);
        this._value = null;
        this._fresh = false;
        // TODO: staticDeps option for optimization
        this._unlistenDeps();
        let [thisArg, args] = this._getArgs();
        //this.log(`call with ${args}`);
        let v = this._computeFunc.apply(thisArg, args);
        //this.log(`result ${v}`);

        if( typeof(v) != 'object' )
            v = new NodeValue(this, v);

        this._computeCount++;
        this._value = v;
        this._fresh = true;
    }

    // should *only* be called from nodeValueProxyHandler
    get rawValue () { 
        if( ! this._fresh )
            this.compute();
        return this._value;
    }
        
    get value () {
        // this returns a NodeValueProxy on the first compute so that
        // some value with an associated Node (this Node) can be returned
        // without actually invoking the compute func
        // this allows more intuitive syntax to be used during tree
        // construction, which is when the computeFunc could fail because
        // not all of its deps exist yet.
        if( this._computeCount==0 )
            return getNodeValueProxy( this );
        else
            return getValueProxy( this, this.rawValue );
    }
    
}
mixinBlabSpeak(ComputeNode, ['NewValue']);
exports.ComputeNode = ComputeNode;
