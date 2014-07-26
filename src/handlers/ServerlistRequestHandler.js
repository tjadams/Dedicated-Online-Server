/**
 * Created by Tyler Adams on 17/07/2014.
 */

var MaplePacketCreator = require('../MaplePacketCreator.js');
var MapleClient = require('../MapleClient.js');
var Server = require('../../app.js');
var ServerConstants = require('../ServerConstants.js');

function ServerlistRequestHandler(){

};

ServerlistRequestHandler.prototype.handlePacket = function(packet, c){
    console.log("ServerlistRequestHandler handlePacket");

//    if(c.session.writable) {
//        c.session.write(MaplePacketCreator.getEndOfServerList());
//    }else{
//        console.error("getEndOfServerList is not writable");
//    }

    // NOTE: looks like I don't NEED asynchronous output yet with an async/promise library
    var server = Server.getInstance();

    var worlds = server.getWorlds();
    var world;
    for (var i = 0; i < worlds.length; i++) {
        world = worlds[i];
        c.announce(MaplePacketCreator.getServerList(world.id, ServerConstants.WORLD_NAMES[world.id], world.flag, world.eventmsg, world.channels));
    }
    c.announce(MaplePacketCreator.getEndOfServerList());
    c.announce(MaplePacketCreator.selectWorld(0));
    c.announce(MaplePacketCreator.sendRecommended(server.worldRecommendedList));
};

// TODO EDIT STATE LOGIC
ServerlistRequestHandler.prototype.validateState = function(client){
    return true;
};

ServerlistRequestHandler.prototype.toString = function(){
    return "ServerlistRequestHandler";
};

module.exports = ServerlistRequestHandler;