
'use strict';

exports.NODE = Symbol('NODE');
exports.hasNode = x => typeof(x)=='object' && x.hasOwnProperty(exports.NODE);

class NodeValue {
    constructor(node, value) {
        this[exports.NODE] = node;
        this.value = value;
    }
    [Symbol.toPrimitive](hint) {
        return this.value;
    }
}
exports.NodeValue = NodeValue;
