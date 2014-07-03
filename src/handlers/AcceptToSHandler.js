/**
 * Created by Tyler Adams on 29/06/2014.
 */

function AcceptToSHandler(){

};

// TODO EDIT ALL LOGIC
AcceptToSHandler.prototype.handlePacket = function(packet, client){
    console.log("AcceptToSHandler handlePacket");
};


AcceptToSHandler.prototype.validateState = function(client){
    return true;
};

module.exports = AcceptToSHandler;