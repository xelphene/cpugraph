
'use strict';

const {Node} = require('./node');
const {NODE, NODEOBJ} = require('../consts');

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

// TODO: belongs more in tree/
// that's the only place objects like this are created
function isPropNode (o, p) {
    let opd = Object.getOwnPropertyDescriptor(o, p);
    return opd && opd.get && opd.get[NODE];
}
exports.isPropNode = isPropNode;

// TODO: belongs more in tree/
// that's the only place objects like this are created
function nodeOfProp (o,p) {
    let opd = Object.getOwnPropertyDescriptor(o, p);
    if( opd && opd.get && opd.get[NODE] )
        return opd.get[NODE]
    else
        throw new Error(`Object has no property ${p} which is a Node`);
}
exports.nodeOfProp = nodeOfProp;

function hasNode (x) {
    if( typeof(x)=='object' && x.hasOwnProperty(NODE) )
        return true;
    else
        return false;
}
exports.hasNode = hasNode;
