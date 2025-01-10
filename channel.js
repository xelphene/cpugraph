
'use strict';

class ChannelMixin {
    _initChannel (eventTypes) {
        this._eventTypes = new Set(eventTypes);
        this._speakingTo = new Map();
        for( let eventType of eventTypes )
            this._speakingTo.set(eventType, new Set())

        this._hearingFrom = new Set();
    }
    
    speakTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        this._speakingTo.get(eventType).add(callback);
    }
    
    stopSpeakingTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        this._speakingTo.get(eventType).delete(callback);
    }
    
    _say(eventType) {
        if( ! this._speakingTo.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        for( let callback of this._speakingTo.get(eventType) ) {
            const rv = callback();
            if( rv === false ) {
                console.log(`CHAN: CB ${callback.name} returned false`);
                const didDel = this._speakingTo.get(eventType).delete(callback)
            }
        }
    }
    
    _unlistenAll () {
        for( let callback of this._hearingFrom ) {
            console.log(`CHAN: _unlistenAll 1: ${callback.alive} :: ${callback.name}`)
            callback.alive = false;
            console.log(`CHAN: _unlistenAll 2: ${callback.alive} :: ${callback.name}`)
            //this._hearingFrom.delete(callback);
            //callback.speaker.stopSpeakingTo(callback.eventType, callback);
        }
    }
    
    _listenTo (other, eventType, method) {
        var cb = speaker => {
            if( cb.alive ) {
                console.log(`CHAN: CB: ${cb.name} I am alive`);
                method.apply(this, other)
            } else {
                console.log(`CHAN: CB: ${cb.name} I am now dead`);
                this._hearingFrom.delete(cb);
            }
            return cb.alive;
        }
        cb.alive = true;

        const describe = () => `callback ${other.debugName} ${eventType} ${this.debugName}`;
        Object.defineProperty(cb, 'name', {
            //value: `callback ${other.constructor.name} ${eventType} ${this.constructor.name}`
            value: describe()
        });

        //cb.name = 'CBNAME';
        cb.speaker = other;
        cb.receiver = this;
        cb.eventType = eventType;
        cb.method = method;
        
        other.speakTo(eventType, cb);
        this._hearingFrom.add(cb);
    }
    
    _chanDump () {
        console.log(`${this.debugName} chanDump:`);
        console.log(`  speakingTo:`);
        for( let eventType of this._eventTypes ) {
            for( let callback of this._speakingTo.get(eventType) )
                console.log(`    ${callback.name} ${callback.alive}`);
        }
        console.log(`  hearingFrom:`);
        for( let callback of this._hearingFrom )
            console.log(`    ${callback.name} ${callback.alive}`);
    }
}

function mixinChannel (cls, eventTypes)
{
    for( let propName of Object.getOwnPropertyNames(ChannelMixin.prototype) ) {
        if( propName=='constructor' )
            continue;
        console.log(`MIXIN: ${cls.name} ${propName}`);
        if( propName in cls.prototype )
            throw new Error(`class ${cls.name} already has a property named ${propName}`);
        cls.prototype[propName] = ChannelMixin.prototype[propName];
    }
}
exports.mixinChannel = mixinChannel;
