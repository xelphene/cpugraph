
'use strict';

const {Node} = require('./node');
const {hasNode, NODE} = require('../consts');

class DTProxyHandler {
    constructor(listener) {
        this._listener = listener;
    }
    
    log(msg) {
        console.log(`DTProxy(${this._listener.debugName}): ${msg}`);
    }
    
    //has(o, key) {}
    //ownKeys(o) {}
    
    get(o, key) {
        var v = Reflect.get(o, key);

        if( hasNode(v) ) {
            //console.log(`DTProxy: get ${key.toString()} has Node`);
            this.log(`get ${key.toString()} has Node`);
            this._listener.dependOn( v[NODE] );
            return v;
        } else if( v instanceof Node ) {
            this.log(`get ${key.toString()} is Node`);
            this._listener.dependOn( v );
            return v.value;
        } else if( typeof(v)=='object' ) {
            this.log(`get ${key.toString()} other obj`);
            return new Proxy(v, this);
        } else {
            //this.log(`get ${key.toString()} nothing in particular`);
            return v;
        }
    }
}
exports.DTProxyHandler = DTProxyHandler;
