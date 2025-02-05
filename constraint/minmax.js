
'use strict';

const {BinaryConstraint} = require('./binary');

class MinMaxConstraint extends BinaryConstraint {
    constructor({nodeA, op, nodeB}) {
        super({nodeA, op, nodeB})
    }
    
    get validOps () { return ['>=','<='] }

    getBoundaryForNode(node) {
        if( node===this.nodeA ) {
            if( this.op=='>=' )
                return ['min', this.nodeB.value];
            else
                return ['max', this.nodeB.value];
        } else {
            if( this.op=='>=' )
                return ['max', this.nodeA.value];
            else
                return ['min', this.nodeA.value];
        }
    }
    
    check () {
        if( this.op == '>=' )
            return this.nodeA.constraintCheckValue >= this.nodeB.constraintCheckValue;
        else
            return this.nodeA.constraintCheckValue <= this.nodeB.constraintCheckValue;
    }
    
    get debugName () {
        return `${this.nodeA.debugName} ${this.op} ${this.nodeB.debugName}`
    }
}
exports.MinMaxConstraint = MinMaxConstraint;
