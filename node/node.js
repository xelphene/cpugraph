
'use strict';

const {NODE} = require('../consts');
const {Channel} = require('./channel');

class Node {
    constructor ({universe, debugName}) {
        if( universe===undefined )
            throw new Error(`universe was not provided to Node constructor`);
        this._universe = universe;

        if( debugName!==undefined )
            this._debugName = debugName;
        else
            this._debugName = this.constructor.name;
    }
    
    get universe ()   { return this._universe }
    get debugName ()  { return this._debugName }
    set debugName (n) { this._debugName = n }
    
    get [NODE] () { return this }

    get map () {
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
