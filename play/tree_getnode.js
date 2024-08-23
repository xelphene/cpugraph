
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {InputNode, ComputeNode} = require('../');

function main ()
{
    var ei = new InputNode({debugName:'ei'});
    ei.value = 10;
    
    var ec = new ComputeNode({
        bind: [ei],
        func: ei => 222 + ei,
        debugName: 'ec'
    });

    var ET = build();
    ET.d = () => 300;

    var T = build();
    
    T.i = input;
    T.ei = ei;
    T.ec = ec;
    T.et_d = ET.d;
    
    var t = unwrap(T);
    t.i = 100;
    
    console.log( T.ei===ei );
    console.log( T.ec===ec );
    console.log( T.i instanceof InputNode );
    console.log( T.i.value == 100 );
    console.log( T.et_d instanceof ComputeNode );
    console.log( T.et_d.value == 300 );
    
    //console.log( 0+t.ei );
    //console.log( 0+t.ec );
    //console.log( 0+t.et_d );
    
}

if( require.main === module )
    main();
