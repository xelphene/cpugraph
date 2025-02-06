
'use strict';

const {Universe} = require('./universe');
const {NODE, NODEOBJ} = require('./consts');
const {BuildProxy} = require('./tree/build');
const {NodeObjAdjutant} = require('./tree/nodeobj');
const {hasNode} = require('./node/util');
const {Node} = require('./node/node');

// mapper = a Mapper instance
// ie:
//   universe.map.ymirror()
//   universe.map.xlateV(node, node)
function getRegMapObj(universe, mapper) {
    const a = {}; 
    const b = {};
    a[NODEOBJ] = new MapObjAdjutant({obj:a, universe, mapper});
    b[NODEOBJ] = new MapObjAdjutant({obj:b, universe, mapper});
    a[NODEOBJ].twin = b[NODEOBJ];
    b[NODEOBJ].twin = a[NODEOBJ];
    return [a,b];
}
exports.getRegMapObj = getRegMapObj;

class MapObjAdjutant extends NodeObjAdjutant {
    constructor({obj, universe, mapper}) {
        super({obj, universe});
        this._mapper = mapper;
        this._twin = null;
    }
    
    set twin (o) {
        // check if os is really my twin?
        this._twin = o;
    }
    
    get twin () {
        if( this._twin === null )
            throw new Error(`No twin set for MapObjAdjutant`);
        return this._twin
    }
    
    get mapper () { return this._mapper }
    
    handleAssignNode( key, n ) {
        let g = () => n.value;
        g[NODE] = n;
        
        if( n.settable ) {
            Object.defineProperty( this._obj, key, {
                get: g,
                set: x => { n.value = x },
                enumerable: true
            });
        } else {
            Object.defineProperty( this._obj, key, {
                get: g,
                configurable: true,
                enumerable: true
            });
        }
    }
    
    get BuildProxyHandler () { return MapObjBuildProxyHandler }
}

class MapObjBuildProxyHandler extends BuildProxy
{
    canBeNode( v ) {
        if( typeof(v)=='function' && v.length <= this._bindings.length )
            return true
        if( hasNode(v) )
            return true
        if( v instanceof Node )
            return true
        return false
    }
    
    toNode( o, v ) {
        if( typeof(v)=='function' && v.length <= this._bindings.length ) {
            return this._universe.addCompute({
                bind: this._bindings,
                bindThis: o,
                func: v
            });
        }
        if( hasNode(v) ) {
            return nodeOf(v)
        }
        if( v instanceof Node ) {
            return v
        }
        throw new Error(`cannot convert assigned value to Node`);
    }

    set( o, key, v)
    {    
        // normal BuildProxy allows overwrite
        if( o[NODEOBJ].hasOwnProperty(key) )
            throw new Error(`duplicate key ${key} in MapObj`);
        if( o[NODEOBJ].twin.hasOwnProperty(key) )
            throw new Error(`duplicate key ${key} in twin`);
        
        if( this.canBeNode(v) ) {
            v = this.toNode(o, v);
            
            if( ! v.hasDebugName )
                v.debugName = key
            
            o[NODEOBJ].handleAssignNode( key, v );
            o[NODEOBJ].twin.handleAssignNode(
                key,  o[NODEOBJ].mapper.mapNode(v)
            )
            
            return true;
        }
        throw new Error(`unknown set op`);
    }
    
    
}
