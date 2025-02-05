
'use strict';

class ConstraintViolation extends Error {
    constructor({constraint, node, value}) {
        const msg = `Constraint Violation: ${constraint.toStringWithValues()}`;
        super(msg);

        Object.defineProperty(this, 'constraint', {
            enumerable: false,
            value: constraint
        });
        Object.defineProperty(this, 'node', {
            enumerable: false,
            value: node
        });
        Object.defineProperty(this, 'value', {
            enumerable: false,
            value: value
        });
    }
};
exports.ConstraintViolation = ConstraintViolation;
