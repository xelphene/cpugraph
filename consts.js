
'use strict';

exports.NODE = Symbol('NODE');
exports.hasNode = x => typeof(x)=='object' && x.hasOwnProperty(exports.NODE);
