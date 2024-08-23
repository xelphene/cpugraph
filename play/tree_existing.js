
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');

function main ()
{
    //var o = {};
    //o.prop = 'asdf';
    //var T = build(o);
    
    var T = build();
        
    T.i = input;
    T.j = input;
    T.c = t => t.i + t.j;
    T.d = t => t.i * 2;
    T = unwrap(T);
    
    T.i = 10;
    T.j = 20;
    
    T.setIJ = function (newI, newJ) {
        this.i = newI;
        this.j = newJ;
    }
    
    T = build(T);
    T.z = t => t.j - t.i;
    T = unwrap(T);
    
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
    
    console.log('--- setIJ ---');
    T.setIJ(1,2);
    console.log( 0+T.c );
    console.log( 0+T.z );
}

if( require.main === module )
    main();
