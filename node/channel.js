
'use strict';

class Channel {
    constructor(speakingNode, listeningNode) {
        this.speakingNode = speakingNode;
        this.listeningNode = listeningNode;
        this.speakingNode.addSpeakChannel(this);
        this.listeningNode.addHearChannel(this);
    }
    destroy () {
        this.speakingNode.rmSpeakChannel(this);
        this.listeningNode.rmHearChannel(this);
    }
    speakerSpoiled() {
        this.listeningNode.hearSpoiled(this.speakingNode);
    }
    speakerChanged() {
        this.listeningNode.hearChanged(this.speakingNode);
    }
}
exports.Channel = Channel;
