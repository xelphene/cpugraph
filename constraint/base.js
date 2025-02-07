
'use strict';

class Constraint {
    constructor({}) {
    }

    check () { throw new Error('Not Implemented') }
    
    get nodes () { return [] }
    
    pertainsToNode (n) {
        return this.nodes.includes(n)
    }
}
exports.Constraint = Constraint;
