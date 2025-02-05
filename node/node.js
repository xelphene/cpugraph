
'use strict';

const {NODE} = require('../consts');
const {Channel} = require('./channel');

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

}
exports.Node = Node;
