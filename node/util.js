
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
    else
        throw new Error('value has no node');
}
exports.nodeOf = nodeOf;

function hasNode (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return true;
    else
        return false;
}
exports.hasNode = hasNode;
