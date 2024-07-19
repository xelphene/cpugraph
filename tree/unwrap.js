
'use strict';

const {ORIG} = require('./consts');

exports.unwrap = function(buildProxiedObject) {
    return buildProxiedObject[ORIG];
}
