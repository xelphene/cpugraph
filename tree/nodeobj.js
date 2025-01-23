
'use strict';

const {NODEOBJ} = require('../consts');
const {isNode, nodeOf} = require('../node/util');

function createNodeObj (universe) {
    var obj = {};
    obj[NODEOBJ] = new NodeObjAdjutant({obj, universe});
    return obj;
}
exports.createNodeObj = createNodeObj;

function isNodeObj (o) {
    if( NODEOBJ in o ) {
        if( o[NODEOBJ] instanceof NodeObjAdjutant )
            return true;
        else
            throw new Error(`Object ${o} has a NODEOBJ property, but its value is not a NodeObjAdjutant instance.`);
    } else
        return false
}
exports.isNodeObj = isNodeObj;

class AsIs {
    constructor(value) {
        this.value = value;
    }
}
exports.AsIs = AsIs;

function asIs (v) {
    return new AsIs(v);
}
exports.asIs = asIs

function isAsIs (v) {
    return v instanceof AsIs;
}
exports.isAsIs = isAsIs;

class NodeObjAdjutant {
    constructor ({obj, universe}) {
        this._obj = obj;
        if( universe !== undefined )
            this.universe = universe;
        else
            this.universe = null;
    }
    
    // return a list of all keys on this._obj whose values are
    // supplied by Nodes. these will be accessible to computeFuncs
    get nodeKeys () {
        return Object.keys(this._obj).filter(
            k => isNode(this._obj[k])
        );
    }
    
    get nodeObjKeys () {
        return Object.keys(this._obj).filter(
            k => isNodeObj(this._obj[k])
        )
    }
    
    get computeFuncKeys () {
        return Object.keys(this._obj).filter(
            k => isNode(this._obj[k]) || isNodeObj(this._obj[k])
        )
    }
}
exports.NodeObjAdjutant = NodeObjAdjutant;

