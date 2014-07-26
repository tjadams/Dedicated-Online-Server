/**
 * Created by Tyler Adams on 26/07/2014.
 */

var MaplePacketCreator = require('../MaplePacketCreator.js');
var MapleClient = require('../MapleClient.js');
var Server = require('../../app.js');
var ServerConstants = require('../ServerConstants.js');

function ServerStatusRequestHandler(){

};

ServerStatusRequestHandler.prototype.handlePacket = function(packet, c) {
    console.log("ServerStatusRequestHandler handlePacket");

    var world = MaplePacketCreator.readShort(packet);
    var status;
    var num = 0;

    var channels = Server.getInstance().getWorlds()[world].channels;
    var ch;

    for (var i = 0; i < channels.length; i++) {
        ch = channels[i];
        // todo: When creating Channel class, add the getConnectedClients method
        num += ch.getConnectedClients();
    }
if (num >= ServerConstants.CHANNEL_LOAD) {
        status = 2;
    } else if (num >= ServerConstants.CHANNEL_LOAD * .8) {
        status = 1;
    } else {
        status = 0;
    }
    c.announce(MaplePacketCreator.getServerStatus(status));
};

// TODO EDIT STATE LOGIC
ServerStatusRequestHandler.prototype.validateState = function(client){
    return true;
};

ServerStatusRequestHandler.prototype.toString = function(){
    return "ServerStatusRequestHandler";
};

module.exports = ServerStatusRequestHandler;