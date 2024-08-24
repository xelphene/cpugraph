
'use strict';

const {NODE, DEBUG} = require('../consts');
const {hasNode, NodeValue} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');

class ComputeNode extends Node {
    constructor({func, bind, debugName}) {
        super({debugName});
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
        this._dependsOn = new Set();
        
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
        this.listenTo(otherNode);
    }
    
    // called exclusively from Channel when another ComputeNode whose value
    // we depend on spoiled
    hearSpoiled(speakingNode) {
        this._fresh = false;
        this.saySpoiled();
    }
    // called exclusively from Channel when another InputNode whose value we
    // depend on was set to something new
    hearChanged(speakingNode) {
        this._fresh = false;
        this.saySpoiled();
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
        return rv;
    }
    
    compute() {
        this.log(`recomputing`);
        this._value = null;
        this._fresh = false;
        // TODO: staticDeps option for optimization
        this.unlistenAll();
        let args = this._getArgs();
        //this.log(`call with ${args}`);
        let v = this._computeFunc.apply(null, args);
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
        if( ! this._fresh )
            this.compute();
        return getNodeValueProxy( this );
    }
}
exports.ComputeNode = ComputeNode;
