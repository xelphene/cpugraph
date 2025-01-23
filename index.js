
'use strict';

exports.NODE = require('./consts').NODE;
exports.nodeOf = require('./node/util').nodeOf;
exports.hasNode = require('./node/util').hasNode;
exports.isNode = require('./node/util').isNode;

exports.Node = require('./node/node').Node;
exports.ComputeNode = require('./node/compute').ComputeNode;
exports.InputNode = require('./node/input').InputNode;
exports.StretchNode = require('./node/stretch').StretchNode;

exports.input = require('./tree').input;

exports.tree = require('./tree');
exports.universe = require('./universe');
exports.Universe = exports.universe.Universe;
