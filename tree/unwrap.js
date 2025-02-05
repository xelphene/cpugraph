
'use strict';

const {ORIG} = require('./consts');

exports.unwrap = function(buildProxiedObject) {
    if( buildProxiedObject[ORIG] !== undefined )
        return buildProxiedObject[ORIG];
    else
        return buildProxiedObject;
}
