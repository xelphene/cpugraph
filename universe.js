
'use strict';

const {unwrap} = require('./tree/unwrap');
const {nodeOf} = require('./node/util')
const {InputNode} = require('./node/input');
const {ComputeNode} = require('./node/compute');
const {MapNode} = require('./node/map');
const {DeltaNode} = require('./node/delta')
const {Mapper} = require('./mapper');
const {createNodeObj, isNodeObj} = require('./tree/nodeobj');
const {BuildFactory} = require('./tree/buildfactory');
const {THIS} = require('./consts');

class Universe {
    constructor() {
        this._nodes = new Set();
        this._cc = new ConstraintContainer(this)
        
        this._mappers = [];
        this.map = {}
    }
    
    registerMap(name, fwdMapFunc, revMapFunc) {
        // TODO: check for conflicting names
        // if present, see if fwdMapFunc and revMapFunc are the same
        //  and then ignore
        // otherwise, throw Error
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
    
    addCompute({bind, bindThis, func, debugName}) {
        const n = new ComputeNode({bind, bindThis, func, debugName, universe: this});
        this._nodes.add(n);
        return n;
    }
    
    addInput({value, debugName}) {
        const n = new InputNode({debugName, value, universe: this});
        this._nodes.add(n);
        return n;
    }

    addMap({debugName, mapper, srcNode}) {
        const n = new MapNode({debugName, mapper, srcNode, universe:this});
        this._nodes.add(n);
        return n;
    }

    addDelta({getFunc, setFunc, bind, bindThis, debugName}) {
        const n = new DeltaNode({
            universe:this, getFunc, setFunc, bind, bindThis, debugName
        })
        this._nodes.add(n)
        return n;
    }
    
    get constraints () { return this._cc }

    // TODO: makeBuildPRoxy and define* are a mess.  repurpose 'opts' as
    // just an optional array of bindings.  that's all its ever use for
    // anyway.  or at least do this in one of the define* funcs
    
    makeBuildProxy(root, opts) {
        const {BuildProxy} = require('./tree/build');
        
        if( opts===undefined )
            opts = {};
        else if( Array.isArray(opts) ) {
            for( let i=0; i<opts.length; i++ ) {
                if( opts[i] !== THIS )
                    opts[i] = unwrap(opts[i]);
            }
            opts = {bind: opts};
        }

        if( root===undefined || root===null )
            //root = {};
            root = createNodeObj(this);
        else {
            if( ! isNodeObj(root) )
                throw new Error(`root is not a NodeObj`);
        }

        if( opts.bind===undefined )
            opts.bind = [root];
        else {
        }
        
        for( let i=0; i<opts.bind.length; i++ )
            if( opts.bind[i] === THIS ) {
                opts.bind[i] = root;
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
        } else if( arguments.length==2 ) {
            if( Array.isArray(arguments[0]) && typeof(arguments[1])=='function' ) {
                var obj = null;
                var func = arguments[1];
                var opts = arguments[0];
            } else {
                var obj = arguments[0];
                var func = arguments[1];
                var opts = {};
            }
        } else
            throw new Error(`Wrong number of arguments (${arguments.length}) to Universe.defineObj()`);
            
        return this.defineObjOpt(obj, opts, func);
    }
    
    defineObjOpt(obj, opts, func) {
        if( obj!==undefined && obj!==null )
            obj = unwrap(obj)
        const [root, buildProxy, buildProxyHandler] = this.makeBuildProxy(obj, opts);
        const buildFactory = new BuildFactory(this, buildProxyHandler.bindings);
        func.apply(null, [buildProxy, buildFactory]);
        return unwrap( buildProxy );
    }

    get nodes () { return this._nodes }

    checkConstraints () {
        // TODO: this is slow. unecessarily checking every single node.
        for( let n of this.nodes )
            n.checkConstraints()
    }

    checkConstraintsAll () {
        var violations = []
        for( let n of this.nodes ) {
            violations = violations.concat( n.checkConstraintsAll() )
        }
        return violations
    }
    
    setValues (deltas) {
        for( let [nodeIsh, _] of deltas ) {
            const node = nodeOf(nodeIsh)
            
            if( node.settable ) {
                // do nothing
            } else if ( node instanceof DeltaNode ) {
                // TODO: recurse this op
                throw new Error('delta recurse not implemented')
            } else
                throw new Error(`delta target ${nodeOf(nodeIsh).debugName} is not settable`)
        }
        
        const reversions = []

        for( let [nodeIsh, newValue] of deltas ) {
            const node = nodeOf(nodeIsh)
            reversions.push([node, node.value])
            //node.value = value
            node.setValue(newValue, {checkConstraints:false})
        }
        
        const cvs = this.checkConstraintsAll()
        
        if( cvs.length==0 ) {
            return {
                ok: true,
                cvs
            }
        } else {
            for( let [node,origValue] of this._reversions )
                node.value = origValue
            return {
                ok: false,
                cvs
            }
        }
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

