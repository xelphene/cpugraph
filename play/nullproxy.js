
'use strict';

const nullProxyHandler = {
    get: (o, key) => {
        console.log(key);
        return Reflect.get(o, key);
    },
};
exports.nullProxyHandler = nullProxyHandler;
