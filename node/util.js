
'use strict';

const {Node} = require('./node');
const {NodeHandle} = require('./handle');
const {NODE} = require('../consts');

class NodeValue {
    constructor(node, value) {
        //this[NODE] = node;
        this.value = value;
    }
    [Symbol.toPrimitive](hint) {
        return this.value;
    }
}
exports.NodeValue = NodeValue;

function nodeOf (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return x[NODE];
    else if( typeof(x)=='object' && x instanceof Node )
        return x;
    else
        throw new Error('value has no node');
}
exports.nodeOf = nodeOf;

function isNode (x) {
    // done in this order to avoid premature computes via NodeValueProxy
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return true;
    if( typeof(x)=='object' && x instanceof Node )
        return true;
    return false;
}
exports.isNode = isNode;

function hasNode (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return true;
    else
        return false;
}
exports.hasNode = hasNode;

function handleOf (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return x[NODE].handle;
    else if( typeof(x)=='object' && x instanceof Node )
        return x.handle;
    else if( typeof(x)=='object' && x instanceof NodeHandle)
        return x;
    else
        throw new Error('value has no node');
}
exports.handleOf = handleOf;

function isHandle (x) {
    if( typeof(x)=='object' && x instanceof NodeHandle )
        return true;
    return false;
}
exports.isHandle = isHandle;
