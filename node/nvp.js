
'use strict';

const {NODE} = require('../consts');


const nodeValueProxyHandler = {
    get: (node, key) => {
        if( key===NODE )
            return node;
        return Reflect.get(node.rawValue, key);
    },
    set: (node, key, value) => {
        if( key===NODE )
            throw new Error('set invalid for [NODE]');
        
        if (key in node.rawValue) {
            return false;
        }
        return node.rawValue.setItem(key, value);
    },
    deleteProperty: (node, key) => {
        if( key===NODE )
            throw new Error('deletePropery invalid for [NODE]');
        
        if (!(key in node.rawValue)) {
            return false;
        }
        return node.rawValue.removeItem(key);
    },
    ownKeys: node => {
        return node.rawValue.keys().concat(NODE);
    },
    has: (node, key) => {
        if( key===NODE )
            return true;
        return key in node.rawValue || node.rawValue.hasItem(key);
    },
    defineProperty: (node, key, descriptor) => {
        if( key===NODE )
            throw new Error('defineProperty invalid for [NODE]');
        Object.defineProperty(node.rawValue, key, descriptor);
        return node.rawValue;
    },
    getOwnPropertyDescriptor: (node, key) => {
        if( key===NODE )
            return {
                value: node,
                writable: false,
                enumerable: false,
                configurable: true // TODO: make it non-configurable in Node
            }
        else
            return Object.getOwnPropertyDescriptor(node.rawValue, key);
    },
};

function getNodeValueProxy(node) {
    return new Proxy(node, nodeValueProxyHandler);
};
exports.getNodeValueProxy = getNodeValueProxy;
