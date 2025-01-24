
'use strict';

const {unwrap} = require('./tree/unwrap');
const {InputNode} = require('./node/input');
const {ComputeNode} = require('./node/compute');
const {Mapper} = require('./mapper');
const {createNodeObj, isNodeObj} = require('./tree/nodeobj');
const {BuildFactory} = require('./tree/buildfactory');

class Universe {
    constructor() {
        this._nodes = new Set();
        this._cc = new ConstraintContainer(this)
        
        this._mappers = [];
        this.map = {}
    }
    
    registerMap(name, fwdMapFunc, revMapFunc) {
        const u = this;
        this.map[name] = function () {
            return u.getMapper(fwdMapFunc, revMapFunc, [...arguments]);
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
    
    makeBuildProxy(root, opts) {
        const {BuildProxy} = require('./tree/build');
        
        if( opts===undefined )
            opts = {};
        else if( Array.isArray(opts) )
            opts = {bind: opts};

        if( root===undefined || root===null )
            //root = {};
            root = createNodeObj(this);
        else
            if( ! isNodeObj(root) )
                throw new Error(`root is not a NodeObj`);

        if( opts.bind===undefined )
            opts.bind = [root];
        else {
        }

        const buildProxyHandler = new BuildProxy(this, opts.bind);
        const buildProxy = new Proxy(root, buildProxyHandler);
        
        return [root, buildProxy, buildProxyHandler]
    }
    
    defineTree(root, opts) {
        return this.makeBuildProxy(root, opts)[1];
    }
    
    defineNewTree(opts) {
        return this.makeBuildProxy(null, opts);
    }
    
    defineObj() {
        if( arguments.length==1 ) {
            if( typeof(arguments[0]) != 'function' )
                throw new TypeError(`function required for argument if 1 argument is provided`);
            var obj = null;
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
        const [root, buildProxy, buildProxyHandler] = this.makeBuildProxy(obj, opts);
        const buildFactory = new BuildFactory(this, buildProxyHandler);
        func.apply(null, [buildProxy, buildFactory]);
        return unwrap( buildProxy );
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

