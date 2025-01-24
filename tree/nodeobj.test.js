
'use strict';

const {unwrap, nodeOf, nodeOfProp, Universe, input, subobj, asIs, NODEOBJ} = require('../');

beforeEach( () => {
    global.console = require('console');
});

function getSubTree (U, x, y) {
    return U.defineObj( T => {
        T.x = x
        T.y = y
        T.sc = t => (t.x+t.y)*2
    });
}

test('nodeobj', () => {

    const U = new Universe();
    
    var setI_saw_j2_as = null;
    
    const t = U.defineObj( T => {
        T.i = input
        T.j = input
        T.s = t => t.i+t.j
        T.j2 = t => t.j*2
        
        T.setI = asIs( function(v) {
            //console.log(`in some asIs function. this.s = ${this.s}`);
            //setI_saw_j2_as = 0+unwrap(this.j2);
            setI_saw_j2_as = this.j2;
            this.i = v;
        });
        
        T.nah = t => t.setI(-777);
        
        T.sub = U.defineObj( S => {
            S.s = () => 222
        })
        
        T.sub2 = U.defineObjOpt(null, [T], S2 => {
            S2.s = t => t.i * t.j
        });
        
        T.sub3 = subobj
        T.sub3.s = t => t.i * t.j * 10
        
        T.subt = getSubTree(U, T.j, T.s)
        
        T.r = t => t.subt.sc + 1;
    })
    
    nodeOf(t.r).debugName = 't.r';
    t.i = 1;
    t.j = 2;

    expect( 0+t.s ).toBe( 3 );
    
    expect( t[NODEOBJ].computeFuncKeys.length ).toBe( 10 );
    for( let k of ['i', 'j', 's',  'j2', 'nah',  'sub', 'sub2', 'sub3', 'subt', 'r'] )
        expect( t[NODEOBJ].computeFuncKeys ).toContain( k )
    
    expect( () => 0+t.nah ).toThrow( 'Attempt to access key setI whose value is neither a Node nor a NodeObj' );

    // leaving the intentionally-broken 'nah' prop causes some strange
    // errors later if jest tries to pretty-print the tree
    Object.defineProperty( t, 'nah', {value:0});

    // set t.i = 100 via setI(100)

    expect( nodeOfProp(t,'s').computeCount ).toBe( 1 );
    expect( setI_saw_j2_as ).toBe( null );
    t.setI( 100 );
    expect( 0+setI_saw_j2_as ).toBe( 4 );
    expect( nodeOfProp(t,'s').computeCount ).toBe( 1 );
    expect( 0+t.s ).toBe( 102 );
    expect( nodeOfProp(t,'s').computeCount ).toBe( 2 );
    expect( 0+t.sub.s ).toBe( 222 );
    expect( 0+t.sub2.s ).toBe( 200 );
    expect( 0+t.sub3.s ).toBe( 2000 );

    // subtree

    expect( 0+t.j ).toBe( 2 );
    expect( 0+t.s ).toBe( 102 );
    expect( 0+t.subt.sc ).toBe( 208 );

    expect( nodeOf(t.subt.sc).deps.size ).toBe( 2 );

    expect( nodeOfProp(t.subt,'sc').deps )
        .not.toContain( nodeOfProp(t, 'i') );
    expect( nodeOfProp(t.subt,'sc').deps )
        .toContain( nodeOfProp(t, 'j') );
    expect( nodeOfProp(t.subt,'sc').deps )
        .toContain( nodeOfProp(t, 's') );
    
    expect( 0+t.r ).toBe( 209 );
    expect( nodeOfProp(t,'r').deps.size ).toBe( 1 );
    expect( nodeOfProp(t,'r').deps ).toContain( nodeOfProp(t.subt,'sc') )
        
    // set t.j = 3    
    
    expect( nodeOfProp(t,'s').computeCount ).toBe( 2 );    
    t.j = 3;
    expect( nodeOfProp(t,'r').fresh ).toBe( false );

    expect( 0+t.subt.sc ).toBe( 212 );
    expect( nodeOfProp(t.subt,'sc').computeCount ).toBe( 2 );
    
    expect( 0+t.r ).toBe( 213 );
    expect( nodeOfProp(t,'r').computeCount ).toBe( 2 );
    
    expect( nodeOfProp(t,'s').computeCount ).toBe( 3 );
})

