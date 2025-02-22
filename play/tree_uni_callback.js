
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');

function main ()
{
    const u = new Universe();
    const T = u.defineObj( T => {
        T.i = input;
        T.j = input;
        T.c = t => t.i + t.j;
        T.d = t => t.i * 2;
    });
    u.defineObj( T, T => {
        T.e = t => t.c * 10;
    });    

    T.i = 10;
    T.j = 20;
    
    console.log( `T.c: ${0+T.c}` );
    console.log( `T.d: ${0+T.d}` );
    console.log( `T.e: ${0+T.e}` );
    
    //console.log( T.c[NODE] );
    //console.log( T.c[NODE].depsDebugNames );
    
    console.log('--- change input t.j');
    
    T.j = 200;
    console.log( 0+T.c );
    
    //console.log( T );
    console.log( nodeOf(T.c).debugName );
    
    console.log(T);
}

if( require.main === module )
    main();
