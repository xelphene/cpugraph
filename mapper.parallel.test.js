
'use strict';

const {NODE, nodeOf} = require('./');
const {build, unwrap, input} = require('./tree');
const {Universe} = require('./universe');

test('parallel map', () => {
    const U = new Universe();

    var ptA = U.addCompute({ func: () => ({x:1, y:1}) });
    var ptB = U.addCompute({ func: () => ({x:2, y:2}) });
    var ptC = U.addCompute({ func: () => ({x:3, y:3}) });
    
    var dx1 = U.addInput({});
    var dy1 = U.addInput({});
    dx1.value = 1;
    dy1.value = 1;

    var dx2 = U.addInput({});
    var dy2 = U.addInput({});
    dx2.value = 10;
    dy2.value = 10;

    function mapXlateFwd(dx, dy, pt) { return {x: pt.x+dx, y: pt.y+dy} }
    function mapXlateRev(dx, dy, pt) { return {x: pt.x-dx, y: pt.y-dy} }    
    U.registerMap('xlate', mapXlateFwd, mapXlateRev);
    
    var mA  = ptA.map.xlate( dx1, dy1  );
    var mAA = mA.map.xlate(  dx2, dy2 );
    var mB  = ptB.map.xlate( dx1, dy1  );
    var mBB = mB.map.xlate(  dx2, dy2 );
    var mC  = ptC.map.xlate( dx1, dy1 );
    
    expect(  mA.value.x   ).toBe(   2  ); expect(  mA.value.y   ).toBe(  2   );
    expect(  mAA.value.x  ).toBe(  12  ); expect(  mAA.value.y  ).toBe(  12  );
    expect(  mB.value.x   ).toBe(   3  ); expect(  mB.value.y   ).toBe(  3   );
    expect(  mBB.value.x  ).toBe(  13  ); expect(  mBB.value.y  ).toBe(  13  );

    expect(  mA.mapper.hasMapForSrc(ptB)             ).toBe(  true  );
    expect(  mA.mapper.existingMapNode(ptB)          ).toBe(  mB    );
    expect(  mA.mapper.existingMapNode(ptB).value.x  ).toBe(  3     );
    expect(  mA.mapper.existingMapNode(ptB).value.y  ).toBe(  3     );

    expect(  mAA.mapper.hasMapForSrc(mB)              ).toBe(  true  );
    expect(  mAA.mapper.existingMapNode(mB)           ).toBe(  mBB   );
    expect(  mAA.mapper.existingMapNode(mB).value.x   ).toBe(  13    );
    expect(  mAA.mapper.existingMapNode(mB).value.y   ).toBe(  13    );
})
