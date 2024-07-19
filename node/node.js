
'use strict';

const {Channel} = require('./channel');

class Node {
    constructor () {
        this._speakingTo = new Set();
        this._hearingFrom = new Set();
        this._debugName = '[Node]';
    }
    
    get debugName ()  { return this._debugName }
    set debugName (n) { this._debugName = n }
    
    listenTo(node) {
        var c = new Channel(node, this);
    }
    unlistenAll() {
        let l = [...this._hearingFrom];
        for( let c of l )
            c.destroy();
    }
    
    hearSpoiled (n) { }
    hearChanged (n) { }
    saySpoiled () {
        for( let c of this._speakingTo )
            c.speakerSpoiled();
    }
    sayChanged () {
        for( let c of this._speakingTo )
            c.speakerChanged();
    }

    get speakingTo  () { return this._speakingTo }
    get hearingFrom () { return this._hearingFrom }
    get hearingFromNodes () { return [...this._hearingFrom].map( c => c.speakingNode ) }
    
    // these should ONLY be called from Channel
    addSpeakChannel (c) { this._speakingTo.add(c); }
    rmSpeakChannel  (c) { this._speakingTo.delete(c); }
    addHearChannel  (c) { this._hearingFrom.add(c); }
    rmHearChannel   (c) { this._hearingFrom.delete(c); }
}
exports.Node = Node;
