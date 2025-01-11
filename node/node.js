
'use strict';

const {NODE} = require('../consts');
const {Channel} = require('./channel');

class Node {
    constructor ({universe, debugName}) {
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
}
exports.Node = Node;
