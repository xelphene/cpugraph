
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');

function main ()
{
    const U = new Universe();
    var T = U.defineTree();
    T.i = input;
    T.j = input;
    T.c = t => t.i + t.j;
    T.d = t => t.i * 2;
    T = unwrap(T);
    
    T.i = 10;
    T.j = 20;
    
    console.log( 0+T.c );
    console.log( 0+T.d );
    
    //console.log( T.c[NODE] );
    //console.log( T.c[NODE].depsDebugNames );
    
    console.log('--- change input t.j');
    
    T.j = 200;
    console.log( 0+T.c );
    //console.log( T );
    console.log( nodeOf(T.c).debugName );
    console.log(T);
    
    console.log('--- change input t.i');
    
    T.i = 500;
    console.log( 0+T.c );
    //console.log( T );
    console.log( nodeOf(T.c).debugName );
    console.log(T);
    
    console.log('===============');

    //console.log(`c hearingFrom:`);
    //console.log( [...nodeOf( T.c )._hearingFrom].map( cb => cb.name) );

    nodeOf(T.c)._chanDump();
    nodeOf(T.d)._chanDump();
    nodeOf(T.i)._chanDump();
    nodeOf(T.j)._chanDump();
    //console.log( [...nodeOf( T.i )._speakingTo] );
}

if( require.main === module )
    main();
