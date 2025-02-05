
'use strict';

const {Constraint} = require('./base');

class BindFuncConstraint extends Constraint {
    constructor({nodes, func}) {
        super({});
        this._func = func;
        this._nodes = nodes;
    }
    check () {
        return this._func.apply(null, this._nodes.map(n => n.value) );
    }

    appliesToNode(node) {
        return this._nodes.includes(node);
    }

    toString () {
        return `${this._nodes.map(n => n.fullName)}`;
    }

    get nodes () { return this._nodes }
}
exports.BindFuncConstraint = BindFuncConstraint;
