
'use strict';

exports.NODE = Symbol('NODE');
exports.hasNode = x => typeof(x)=='object' && x.hasOwnProperty(exports.NODE);
exports.DEBUG = false;
exports.NODEOBJ = Symbol('NODEOBJ');
exports.subobj = Symbol('subobj');
