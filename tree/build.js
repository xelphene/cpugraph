
'use strict';

const {ORIG, input, DEBUG, subobj} = require('./consts');
const {NODE, NODEOBJ} = require('../consts.js');
const {isNode, nodeOf, hasNode} = require('../node/util.js');
const {Node} = require('../node/node');
const {ComputeNode} = require('../node/compute');
const {InputNode} = require('../node/input');
const {Universe} = require('../universe');
const {isNodeObj, isAsIs, createNodeObj} = require('./nodeobj');

// TODO: rename to BuildProxyHandler. this isn't an actual Proxy
class BuildProxy
{
    constructor( universe, bindings ) {
        if( ! (universe instanceof Universe) )
            throw new Error(`Universe instance required`);
        this._universe = universe;
        this._bindings = bindings;
    }

    get bindings () { return this._bindings }
    
    log( msg ) {
        if( DEBUG )
            console.log(`BuildProxy: ${msg}`);
    }

    get( o, key ) {
        if( ! isNodeObj(o) )
            throw new Error(`BuildProxy target is invalid`);
        
        if( key===ORIG )
            return o;
        
        let opd = Object.getOwnPropertyDescriptor(o, key);
        if( opd && opd.get && opd.get[NODE] )
            return opd.get[NODE];
        
        if( isNodeObj(Reflect.get(o, key)) )
            return new Proxy(o[key], new BuildProxy(this._universe, this._bindings) );
                    
        return Reflect.get(o, key);
    }
    
    set( o, key, v ) {
        //this.log(`SET. ${key.toString()} = ${v.toString()}`);
        
        if( typeof(v)=='function' && v.length <= this._bindings.length ) {
            //let n = new ComputeNode({
            //    universe: this._universe,
            //    bind: this._bindings,
            //    func: v,
            //    debugName: key
            //});
            let n = this._universe.addCompute({
                bind: this._bindings,
                func: v,
                debugName: key
            });
            let g = () => n.value;
            g[NODE] = n;
            Object.defineProperty(o, key, {
                get: g,
                configurable: true,
                enumerable: true,
            });
            return true;
        }

        if( typeof(v)=='function' && v.length > this._bindings.length ) {
            const buildProxyHandler = this;
            o[key] = function () {
                var args = buildProxyHandler.bindings.map(
                    x => isNode(x) ? nodeOf(x).value : x
                )
                args = args.concat([...arguments]);
                return v.apply(this, args);
            }
            return true;
        }
        
        if( v===input ) {
            //let n = new InputNode({universe: this._universe, debugName: key});
            let n = this._universe.addInput({debugName: key});
            let g = () => n.value;
            g[NODE] = n;
            Object.defineProperty( o, key, {
                get: g,
                set: v  => {
                    //console.log(`intermediate InputNode set called. v=${v}`);
                    n.value = v
                },
                enumerable: true
            });
            return true;
        }
        
        if( v===subobj ) {
            o[key] = createNodeObj();
            return true;
        }
        
        if( isAsIs(v) ) {
            o[key] = v.value;
            return true;
        }
        
        if( isNodeObj(v) ) {
            o[key] = v;
            return true;
        }
                
        if( hasNode(v) ) {
            let g = () => nodeOf(v).value;
            g[NODE] = nodeOf(v);
            if( nodeOf(v).settable ) {
                Object.defineProperty( o, key, {
                    get: g,
                    set: x => { nodeOf(v).value = x },
                    enumerable: true
                });
            } else {
                Object.defineProperty( o, key, {
                    get: g,
                    configurable: true,
                    enumerable: true
                });
            }
            return true;
        }

        // TODO: is this not redundant with if( hasNode(v) ) now?
        if( v instanceof Node ) {
            let g = () => v.value;
            g[NODE] = v;
            if( v.settable ) {
                Object.defineProperty( o, key, {
                    get: g,
                    set: x => { v.value = x },
                    enumerable: true
                });
            } else {
                Object.defineProperty( o, key, {
                    get: g,
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
