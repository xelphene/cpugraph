
'use strict';

class Constraint {
    constructor({}) {
    }

    check () { throw new Error('Not Implemented') }
    
    get nodes () { return [] }
}
exports.Constraint = Constraint;
