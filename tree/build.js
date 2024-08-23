
'use strict';

const {ORIG, input} = require('./consts');
const {nodeOf, hasNode} = require('../consts.js');
const {Node} = require('../node/node');
const {ComputeNode} = require('../node/compute');
const {InputNode} = require('../node/input');

class BuildProxy
{
    constructor( bindings ) {
        this._bindings = bindings;
    }
    
    log( msg ) {
        console.log(`BuildProxy: ${msg}`);
    }

    get( o, key ) {
        if( key===ORIG )
            return o;
        
        return Reflect.get(o, key);
    }
    
    set( o, key, v ) {
        this.log(`SET. ${key.toString()} = ${v.toString()}`);
        
        if( typeof(v)=='function' ) {
            let n = new ComputeNode({
                bind: this._bindings,
                func: v,
                debugName: key
            });
            Object.defineProperty(o, key, {
                get: () => n.value,
                configurable: true,
                enumerable: true,
            });
            return true;
        }
        
        if( v===input ) {
            let n = new InputNode({debugName: key});
            Object.defineProperty( o, key, {
                get: () => n.value,
                set: v  => {
                    //console.log(`intermediate InputNode set called. v=${v}`);
                    n.value = v
                },
                enumerable: true
            });
            return true;
        }
        
        if( hasNode(v) ) {
            if( nodeOf(v).settable ) {
                Object.defineProperty( o, key, {
                    get: () => nodeOf(v).value,
                    set: x => { nodeOf(v).value = x },
                    enumerable: true
                });
            } else {
                Object.defineProperty( o, key, {
                    get: () => nodeOf(v).value,
                    configurable: true,
                    enumerable: true
                });
            }
            return true;
        }

        if( v instanceof Node ) {
            if( v.settable ) {
                Object.defineProperty( o, key, {
                    get: () => v.value,
                    set: x => { v.value = x },
                    enumerable: true
                });
            } else {
                Object.defineProperty( o, key, {
                    get: () => v.value,
                    configurable: true,
                    enumerable: true
                });
            }
            return true;
        }
        
        throw new Error(`unknown set op`);
    }
}
exports.BuildProxy = BuildProxy;

function build (root, opts)
{
    if( opts===undefined )
        opts = {};
    else if( Array.isArray(opts) )
        opts = {bind: opts};

    if( root===undefined || root===null )
        root = {};
    //else if( root instanceof PotentialNode )
    //    root = root[pbExist]();
    //else
    //    root = unwrap(root);

    if( opts.bind===undefined )
        opts.bind = [root];
    else {
        //opts.bind = opts.bind.map(unwrap);
        //for( let i=0; i<opts.bind.length; i++ )
        //    if( opts.bind[i] instanceof PotentialNode )
        //        opts.bind[i] = opts.bind[i][pbExist]();
    }

    // do this?
    /*
    [Symbol.for('nodejs.util.inspect.custom')] () {
        return util.inspect( ... );
    }
    */
    
    const bp = new BuildProxy(opts.bind);
    
    return new Proxy(root, bp);
}
exports.build = build;
