
'use strict';

const {NODE} = require('../consts');
const {Channel} = require('./channel');
const {ConstraintViolation} = require('../errors');

class Node {
    constructor ({universe, debugName}) {
        this._universe = universe;
        this._constraints = new Set();
        this._debugName = debugName;
    }
    
    get universe ()   { return this._universe }
    get hasDebugName () { return this._debugName!==undefined }
    get debugName ()  {
        if( this._debugName!==undefined )
            return this._debugName
        else
            return this.constructor.name;
    }
    set debugName (n) { this._debugName = n }
    
    get [NODE] () { return this }

    get map () {
        if( this._universe===undefined )
            throw new Error(`Node was built without a Universe`);
        //console.log(this.universe);
        const mapSrcNode = this;
        const universe = this.universe;
        const uMapProxyHandler = {
            get: (obj, key) => {
                //console.log(`uMapProxyHandler GET ${key}`);
                if( universe.map.hasOwnProperty(key) ) {
                    return function () {
                        const mapper = universe.map[key](...arguments);
                        //console.log(mapper);
                        return mapper.mapNode(mapSrcNode);
                    }
                } else
                    throw new Error(`No mapping named ${key} is registered on Universe`);
            }
        }
        return new Proxy( universe.map, uMapProxyHandler);
    }
    
    addConstraint (c) { this._constraints.add(c) }

    * iterConstraints () {
        for( let c of this._constraints )
            yield c
    }
    
    checkConstraints() {
        for( let c of this.iterConstraints() ) {
            if( ! c.check() )
                throw new ConstraintViolation({
                    node: this,
                    constraint: c,
                    value: this.constraintCheckValue
                });
            //if( ! c.checkValueForNode(this, value) )
            //    throw new ConstraintViolation({node: this, constraint: c, value});
        }
    }

}
exports.Node = Node;
