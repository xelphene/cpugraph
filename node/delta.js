
'use strict';

const {isNode, hasNode, NodeValue} = require('./util');
const {Node} = require('./node');
const {mixinBlabSpeak} = require('../blab');
/*
const {NODE, DEBUG} = require('../consts');
const {DTProxyHandler} = require('./dtproxy');
const {getNodeValueProxy, getValueProxy} = require('./nvp');
const {isNodeObj} = require('../tree/nodeobj');
*/

const {ComputeNode} = require('./compute')

class DeltaNode extends ComputeNode {
    constructor({universe, getFunc, setFunc, bind, bindThis, debugName}) {
        super({universe, func: getFunc, bind, bindThis, debugName})
        this._setFunc = setFunc
    }
    
    _setFuncArgs ( v ) {
        var rv = [];
        for( let b of this._bindings ) {
            if( hasNode(b) )
                rv.push( b );
            else if( b instanceof Node )
                rv.push( b.value );
            else
                rv.push(b);
        }
        
        rv.push(v)
        
        return [this._bindThis, rv];
    }

    computeDelta( v ) {
        let [thisArg, args] = this._setFuncArgs( v );
        return this._setFunc.apply(thisArg, args)
    }
    
    /*
    // TODO: implement this via Universe?
    get settable () { return false }
    
    set value (v) {
        for( let [node, value] of delta ) {
            this._applyOneDelta(node, value)
        }

        if( this._universe !== undefined ) {
            // TODO: this is done in universe too...
            // just do it here instead?
            this._universe.checkConstraints();
        }

    }
    */
}
mixinBlabSpeak(DeltaNode, ['NewValue']);
exports.DeltaNode = DeltaNode
