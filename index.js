
'use strict';

exports.NODE = require('./consts').NODE;
exports.nodeOf = require('./node/util').nodeOf;
exports.hasNode = require('./node/util').hasNode;
exports.isNode = require('./node/util').isNode;
exports.nodeOfProp = require('./node/util').nodeOfProp;
exports.isPropNode = require('./node/util').isPropNode;

exports.Node = require('./node/node').Node;
exports.ComputeNode = require('./node/compute').ComputeNode;
exports.InputNode = require('./node/input').InputNode;
exports.StretchNode = require('./node/stretch').StretchNode;
exports.DummyNode = require('./node/dummy').DummyNode;

exports.input = require('./tree').input;
exports.subobj = require('./tree').subobj;

exports.tree = require('./tree');
exports.asIs = require('./tree/nodeobj').asIs;
exports.NODEOBJ = require('./consts').NODEOBJ;
exports.createNodeObj = require('./tree/nodeobj').createNodeObj;
exports.NodeObjAdjutant = require('./tree/nodeobj').NodeObjAdjutant;
exports.universe = require('./universe');
exports.Universe = exports.universe.Universe;
