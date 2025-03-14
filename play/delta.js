
'use strict';

const {Universe, NODEOBJ, nodeOf} = require('../index')

function main () {
    const u = new Universe()
    const t = u.defineObj( (T,F) => {
        
        T.i1 = F.input()
        T.i2 = F.input()
        T.c1 = t => t.i1 * 10 - t.i2

        
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
    
    console.log( dn.computeDelta(58) )

    console.log('===')
   
    u.setValues( dn.computeDelta(58) )
    t[NODEOBJ].log()
}

if( require.main === module )
    main()
