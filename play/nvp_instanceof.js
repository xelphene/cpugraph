
'use strict';

const {ComputeNode} = require('../');
const og = require('octogeom');
const {nullProxyHandler} = require('./nullproxy');

var a = new ComputeNode({
    bind: [],
    func: () => {
        return new og.Point(1,1);
    },
    debugName: 'a',
});

//console.log( a.value );
console.log( a.value instanceof og.Point );
console.log( a.value.toString() );

/*
var b   = new ComputeNode({
    bind: [],
    func: () => 10
});
b.debugName = 'b';


console.log('------');

const node = {
    nodeProp: 222,
    rawValue: new og.Point(2,2),
};
const pp = new Proxy(node, nullProxyHandler);
console.log(pp);
console.log( pp instanceof og.Point );

*/
