
'use strict';

const {NODE, nodeOf} = require('./');
const {build, unwrap, input} = require('./tree');
const {Universe} = require('./universe');

beforeEach( () => setup() )
afterEach(  () => testResults() )

var U, dx, dy, pt, dx2, dy2, dp, dp2;

function mapXlateFwd(dx, dy, pt) { return {x: pt.x+dx, y: pt.y+dy} }
function mapXlateRev(dx, dy, pt) { return {x: pt.x-dx, y: pt.y-dy} }

function setup () {
    U = new Universe();

    dx = U.addInput({});
    dy = U.addInput({});
    pt = U.addInput({}); // point
    
    pt.value = {x:10, y:10};
    dx.value = 1;
    dy.value = 5;
    
    dx2 = U.addCompute({
        bind: [dx],
        func: dx => dx*10
    });
    dy2 = U.addCompute({
        bind: [dy],
        func: dy => dy*10
    });    
}

function testResults () {
    expect( pt.value.x  ).toBe( 10 ); expect( pt.value.y  ).toBe( 10 );
    expect( 0+dx.value  ).toBe( 1 );  expect( 0+dy.value  ).toBe( 5 );
    expect( dp.value.x  ).toBe( 11 ); expect( dp.value.y  ).toBe( 15 );
    expect( 0+dx2.value ).toBe( 10 ); expect( 0+dy2.value ).toBe( 50 );
    expect( dp2.value.x ).toBe( 21 ); expect( dp2.value.y ).toBe( 65 );
    
    dx.value = 2;
    
    expect( pt.value.x  ).toBe( 10 ); expect( pt.value.y  ).toBe( 10 );
    expect( 0+dx.value  ).toBe( 2 );  expect( 0+dy.value  ).toBe( 5 );
    expect( dp.value.x  ).toBe( 12 ); expect( dp.value.y  ).toBe( 15 );
    expect( 0+dx2.value ).toBe( 20 ); expect( 0+dy2.value ).toBe( 50 );
    expect( dp2.value.x ).toBe( 32 ); expect( dp2.value.y ).toBe( 65 );
    
    dp.value = {x:20, y:20};

    expect( pt.value.x  ).toBe( 18 ); expect( pt.value.y  ).toBe( 15 );
    expect( 0+dx.value  ).toBe( 2 );  expect( 0+dy.value  ).toBe( 5 );
    expect( dp.value.x  ).toBe( 20 ); expect( dp.value.y  ).toBe( 20 );
    expect( 0+dx2.value ).toBe( 20 ); expect( 0+dy2.value ).toBe( 50 );
    expect( dp2.value.x ).toBe( 40 ); expect( dp2.value.y ).toBe( 70 );
    
    expect(  dp2.mapValueToSrc({x:200,y:100})       ).toEqual( expect.objectContaining(  {x: 178, y:45}   ))
    expect(  dp2.mapValueToSrc({x:200,y:100}, pt)   ).toEqual( expect.objectContaining(  {x: 178, y:45}   ))
    expect(  dp2.mapValueToSrc({x:200,y:100}, dp)   ).toEqual( expect.objectContaining(  {x: 180, y:50}   ))
    expect(  dp2.mapValueToSrc({x:200,y:100}, dp2)  ).toEqual( expect.objectContaining(  {x: 200, y:100}  ))
}

test('map via getMapper', () => {
    dp  = U.getMapper(mapXlateFwd, mapXlateRev, [dx,dy]).mapNode( pt );
    dp2 = U.getMapper(mapXlateFwd, mapXlateRev, [dx2,dy2]).mapNode( dp );
});


test('map via registered map func', () => {
    U.registerMap('xlate', mapXlateFwd, mapXlateRev);
    dp  = pt.map.xlate(dx , dy );
    dp2 = dp.map.xlate(dx2, dy2);
});

