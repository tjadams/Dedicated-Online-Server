/**
 * Created by Tyler Adams on 17/07/2014.
 */

var MaplePacketCreator = require('../MaplePacketCreator.js');
var MapleClient = require('../MapleClient.js');
var Server = require('../../app.js');
var ServerConstants = require('../ServerConstants.js');

function ServerlistRequestHandler(){

};

ServerlistRequestHandler.prototype.handlePacket = function(packet, client){
    console.log("ServerlistRequestHandler handlePacket");

    var server = Server.getInstance();

    var worlds = server.getWorlds();
    var world;
    for (var i = 0; i < worlds.length; i++) {
        world = worlds[i];
        c.announce(MaplePacketCreator.getServerList(world.id, ServerConstants.WORLD_NAMES[world.id], world.flag, world.eventmessage, world.channels));
    }
    c.announce(MaplePacketCreator.getEndOfServerList());
    c.announce(MaplePacketCreator.selectWorld(0));
    c.announce(MaplePacketCreator.sendRecommended(server.worldRecommendedList));

};

// TODO EDIT ALL LOGIC
ServerlistRequestHandler.prototype.validateState = function(client){
    return true;
};

ServerlistRequestHandler.prototype.toString = function(){
    return "ServerlistRequestHandler";
};

module.exports = ServerlistRequestHandler;