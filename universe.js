
'use strict';

const {unwrap} = require('./tree/unwrap');
const {InputNode} = require('./node/input');
const {ComputeNode} = require('./node/compute');
const {Mapper} = require('./mapper');

class Universe {
    constructor() {
        this._nodes = new Set();
        this._cc = new ConstraintContainer(this)
        
        this._mappers = [];
        this.map = {}
    }
    
    registerMap(name, getMapper) {
        const u = this;
        this.map[name] = function () {
            return getMapper.apply(null, [...arguments]);
        }
    }
    
    getMapper(fwdMapFunc, revMapFunc, bindNodes) {
        for( let m of this._mappers )
            if( m.matches(fwdMapFunc, revMapFunc, bindNodes) )
                return m;
        const m = new Mapper({
            universe: this,
            fwdMapFunc: fwdMapFunc,
            revMapFunc: revMapFunc,
            bind: bindNodes
        })
        this._mappers.push(m);
        return m;
    }
    
    mapFwd(fwdMapFunc, bindNodes) {
        if( bindNodes===undefined )
            bindNodes=[];
        return this.getMapper(fwdMapFunc, null, bindNodes)
    }

    mapSplit(fwdMapFunc, revMapFunc, bindNodes) {
        if( bindNodes===undefined )
            bindNodes=[];
        return this.getMapper(fwdMapFunc, revMapFunc, bindNodes)
    }
    
    mapSym(mapFunc, bindNodes) {
        if( bindNodes===undefined )
            bindNodes=[];
        return this.getMapper(mapFunc, mapFunc, bindNodes)
    }
    
    addCompute({bind, func, debugName}) {
        const n = new ComputeNode({bind, func, debugName, universe: this});
        this._nodes.add(n);
        return n;
    }
    
    addInput({value, debugName}) {
        const n = new InputNode({debugName, value, universe: this});
        this._nodes.add(n);
        return n;
    }
    
    get constraints () { return this._cc }
    
    defineTree(root, opts) {
        const {BuildProxy} = require('./tree/build');
        
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

        const bp = new BuildProxy(this, opts.bind);

        return new Proxy(root, bp);
    }
    
    defineNewTree(opts) {
        const T = this.defineTree(null, opts);
        return [unwrap(T), T];
    }
    
    defineObj() {
        if( arguments.length==1 ) {
            if( typeof(arguments[0]) != 'function' )
                throw new TypeError(`function required for argument if 1 argument is provided`);
            var obj = {};
            var func = arguments[0];
            var opts = {};
        } else {
            var obj = arguments[0];
            var func = arguments[1];
            var opts = {};
        }
        return this.defineObjOpt(obj, opts, func);
    }
    
    defineObjOpt(obj, opts, func) {
        const bp = this.defineTree(obj, opts);
        func.apply(null, [bp]);
        return unwrap(bp);
    }
}
exports.Universe = Universe;

class ConstraintContainer {
    constructor (universe) {
        this.universe = universe;
        this.constraints = new Map();
    }
    
    addHBound( key, nodeA, op, nodeB, padding ) {
        if( this.constraints.has(key) )
            throw new Error(`duplicate key ${key} for constraint`);

        const c = new HBoundConstraint({
            key, root: this.rootNode,
            nodeA, op, nodeB, padding
        });
        this.constraints.set(key, c);
    }

    addVBound( key, nodeA, op, nodeB, padding ) {
        if( this.constraints.has(key) )
            throw new Error(`duplicate key ${key} for constraint`);
        
        const c = new VBoundConstraint({
            key, root: this.rootNode,
            nodeA, op, nodeB, padding
        });
        this.constraints.set(key, c);
    }
    
    * iterConstraintsForNode (node) {
        for( let c of this.constraints.values() )
            if( c.appliesToNode(node) )
                yield c
    }
    
    addFunc( key, func, bindings ) {
    }
}

