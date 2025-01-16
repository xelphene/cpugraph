
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
    T.e = t => t.d + t.j;
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
    
    console.log('--- change input t.i');
    
    T.i = 500;
    console.log( 0+T.c );
    console.log( 0+T.e );
    //console.log( T );
    console.log( nodeOf(T.c).debugName );
    
    console.log('===============');

    //nodeOf(T.c)._chanDump();
    //nodeOf(T.d)._chanDump();
    //nodeOf(T.i)._chanDump();
    //nodeOf(T.j)._chanDump();

    //console.log( nodeOf(T.j).saysValueChanged );
    //console.log( nodeOf(T.j).saysValueSpoiled );
    //console.log( nodeOf(T.d).saysValueChanged );
    //console.log( nodeOf(T.d).saysValueSpoiled );

    console.log('/');
    
    function cb (handle) {
        console.log(`called back! handle=${handle.debugName} value=${handle.value}`)
        if( handle.value > 100 ) {
            console.log(`  unlisten`);
            return false;
        }
        return true
            
    }
    console.log( `T.d.saysValueSpoiled? ${nodeOf(T.d).handle.saysValueSpoiled}` );
    nodeOf(T.i).handle.onValueChanged( cb );
    nodeOf(T.c).handle.onValueChanged( cb );
    nodeOf(T.i).handle._chanDump();
    T.i = 50;

    T.i = 101;

    T.i = 102;
    nodeOf(T.i).handle._chanDump();
    
}

if( require.main === module )
    main();
