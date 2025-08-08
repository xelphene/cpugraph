
'use strict';

const {nodeOf, hasNode} = require('./node/util');

exports.descFunc = (f, maxLen) => {
    if( f===null )
        return 'null';
    else if( typeof(f)=='function' ) {
        let js = JSON.stringify(f.toString()).slice(1,-1);
        if( js.length > maxLen )
            return js.slice(0,maxLen-3) + '...';
        else
            return js;
    } else
        throw new TypeError(`function or null required for argument 0`);
};


exports.anyToString = (x, maxLen) => {
    if( x===null )
        var s = 'null';
    else if( hasNode(x) )
        var s = `NV: ${exports.anyToString(nodeOf(x).rawValue)}`
    //else if( typeof(x)=='object' && hasNode(x) )
    //    return `Node ${nodeOf(x).debugName}`;
    else if( typeof(x)=='object' && 'toString' in x )
        return x.toString();
    else if( typeof(x)=='object' && ! ('toString' in x) )
        return '[object]'
    else if( typeof(x)=='undefined' )
        var s = 'undefined';
    else if( typeof(x)=='symbol' )
        var s = x.toString();
    else if( typeof(x)=='function' )
        var s = exports.descFunc(x, maxLen);
    else
        var s = ''+x;

    if( maxLen!==undefined && s.length > maxLen )
        return s.slice(0,maxLen-3) + '...';
    else
        return s;
};
