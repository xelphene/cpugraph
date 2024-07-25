
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');

function main ()
{
    var T = build();
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
    console.log( nodeOf(T.c) );
}

if( require.main === module )
    main();
