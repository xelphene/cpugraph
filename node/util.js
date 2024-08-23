
'use strict';

const {Node} = require('./node');
const {NODE} = require('../consts');

class NodeValue {
    constructor(node, value) {
        this[NODE] = node;
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
    return typeof(x)=='object' && x instanceof Node;
}
exports.isNode = isNode;

function hasNode (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return true;
    else
        return false;
}
exports.hasNode = hasNode;
