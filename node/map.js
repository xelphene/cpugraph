
'use strict';

const {NODE, DEBUG} = require('../consts');
const {hasNode, NodeValue} = require('./util');
const {DTProxyHandler} = require('./dtproxy');
const {Node} = require('./node');
const {getNodeValueProxy} = require('./nvp');

class MapNode extends Node {
    constructor({debugName, mapper, srcNode}) {
        super({debugName});
        this._mapper = mapper;
        this._mapper.addMapNode(this);        
    }
    
    hearMapFuncChanged () {
        this._fresh = false;
        this.saySpoiled();
    }
}
exports.MapNode = MapNode;
