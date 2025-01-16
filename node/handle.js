
'use strict';

const {mixinBlabSpeak} = require('../blab');

class NodeHandle {
    constructor() {
        this._node = null;
        this._constraints = new Set();
        this._initChannel();
    }

    get node () { return this._node }

    addConstraint (c) {
        this._constraints.add(c);
    }
    * iterConstraints () {
        for( let c of this._constraints )
            yield c;
    }    
    
    get debugName () { return `Handle/${this.node.debugName}`; }
    
    toString () { return this.debugName }
    
    get value () { return this.node.value }

    get rawValue () { return this.node.rawValue }

    nodeValueChanged () {
        this._sayValueChanged() 
    }
    nodeValueSpoiled () { this._sayValueSpoiled() }

}
mixinBlabSpeak(NodeHandle, ['ValueChanged', 'ValueSpoiled']);
exports.NodeHandle = NodeHandle;


// this function is a friend (in the C++ sense) of Handle and Node
//
// - remove all of oldNode's handles
//
// - give oldNode has an entirely new primary Handle (it's sole)
//
// - give newNode all of oldNode's former handles
//
// - point all of oldNode's handles to newNode
// 
function repointHandles(oldNode, newNode) 
{
    const oldHandles = [];
    oldHandles.push( oldNode._handle );
    oldHandles = oldHandles.concat( oldNode._auxHandles );

    oldNode._handle = new Handle(oldNode);
    oldNode._auxHandles = [];

    newNode._auxHandles = newNode._auxHandles.concat( oldHandles );

    for( let oh of oldHandles )
        oh._node = newNode
}
exports.repointHandles = repointHandles;

function initHandles(node) {
    const {Node} = require('./node');
    
    if( node instanceof Node )
        var handle = new NodeHandle(node);
    else
        throw new Error(`Node instance required`);
    
    handle._node = node;
    node._handle = handle;
    node._auxHandles = [];
}
exports.initHandles = initHandles;
