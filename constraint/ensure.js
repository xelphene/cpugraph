
'use strict';

const {BindFuncConstraint} = require('./bindfunc');
const {MinMaxConstraint} = require('./minmax');
const {unwrap} = require('../');

exports.bindFunc = function( bindings, func, desc ) {
}

exports.rel = function( nodeA, op, nodeB ) {

    nodeA = unwrap(nodeA);
    nodeB = unwrap(nodeB);
    
    const c = new MinMaxConstraint({
        nodeA, op, nodeB
    });
    
    nodeA.addConstraint(c);
    nodeB.addConstraint(c);
}
