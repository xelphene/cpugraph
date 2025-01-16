
'use strict';

const {NODE} = require('../consts');
const {Channel} = require('./channel');
const {initHandles} = require('./handle');

class Node {
    constructor ({universe, debugName}) {
        this._universe = universe;

        this._handle = null;
        this._auxHandles = null;
        initHandles(this);
        
        if( debugName!==undefined )
            this._debugName = debugName;
        else
            this._debugName = this.constructor.name;
    }
    
    get universe ()   { return this._universe }
    get debugName ()  { return this._debugName }
    set debugName (n) { this._debugName = n }
    
    get [NODE] () { return this }
    
    // Handle stuff //////////////////////////
    
    _tellHandlesChanged () {
        this.handles.map( h => h.nodeValueChanged() ) 
    }
    _tellHandlesSpoiled () { 
        this.handles.map( h => h.nodeValueSpoiled() ) 
    }

    get handle () { return this._handle }
    
    get handles () { return [this._handle].concat(this._auxHandles); }

    replace (newNode) {
        repointHandles(this, newNode)
    }
}
exports.Node = Node;
