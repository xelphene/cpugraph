
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
    
    T.ei = ei;
    T.ec = ec;
    T.et_d = ET.d;
    
    T = unwrap(T);
    
    console.log( 0+T.ei );
    console.log( 0+T.ec );
    console.log( 0+T.et_d );
    
}

if( require.main === module )
    main();
