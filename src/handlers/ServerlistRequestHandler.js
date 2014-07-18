/**
 * Created by Tyler Adams on 17/07/2014.
 */

var MaplePacketCreator = require('../MaplePacketCreator.js');
var MapleClient = require('../MapleClient.js');

function ServerlistRequestHandler(){

};

ServerlistRequestHandler.prototype.handlePacket = function(packet, client){
    console.log("ServerlistRequestHandler handlePacket");
};

// TODO EDIT ALL LOGIC
ServerlistRequestHandler.prototype.validateState = function(client){
    return true;
};

ServerlistRequestHandler.prototype.toString = function(){
    return "ServerlistRequestHandler";
};

module.exports = ServerlistRequestHandler;