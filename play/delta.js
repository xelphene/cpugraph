
'use strict';

const {ensureFunc, Universe, NODEOBJ, nodeOf} = require('../index')

function main () {
    const u = new Universe()
    const t = u.defineObj( (T,F) => {
        
        T.i1 = F.input(0)
        T.i2 = F.input(1)
        
        ensureFunc( [T.i1, T.i2], (i1,i2) => Math.abs(i1-i2) < 4 )
        
        T.c1 = t => t.i1 * 10 - t.i2

        ensureFunc( [T.c1], c1 => c1 < 100 )
        
        T.d = F.delta(
            t => t.i1 * 10 + t.i2,
            (t,v) => [
                [t.i1, Math.floor(v/10)],
                [t.i2, v - 10*Math.floor(v/10) ]
            ]
        )
        
    })
    
    u.setValues([
        [t.i1, 3],
        [t.i2, 2]
    ])
    
    const dn = nodeOf( t.d )
    console.log(0+dn.value)
    
    t[NODEOBJ].log()

    console.log('---')
    
    //console.log( dn.computeDelta(92) )

    console.log('===')
   
    //t.i1 = 9; t.i2 = 7; // throws
    
    var result = u.setValues( dn.computeDelta(97) ) // same result, but fine
    console.log(result)
    
    t[NODEOBJ].log()

    console.log('===')

    var result = u.setValues( dn.computeDelta(119) )
    console.log(result)
    
    t[NODEOBJ].log()

    console.log('===')
    
}

if( require.main === module )
    main()
