var MaplePacketCreator = require('../MaplePacketCreator.js');
/**
 * Created by Tyler Adams on 29/06/2014.
 */

function AcceptToSHandler(){

};

// TODO EDIT ALL LOGIC
AcceptToSHandler.prototype.handlePacket = function(packet, client){
//    console.log("AcceptToSHandler handlePacket");

    if((packet.length != 0) || MaplePacketCreator.readByte(packet) != 1 || client.acceptToS()){
        c.session.destroy();
        return;
    }

    // todo code this next part in such a way that when finishLogin has returned its method,
    //      todo the following entire selection statement will execute based on those results
    //          todo NOTE: when I get the result from finshLogin, I think everything after it has to go inside the function
    //          todo NOTE CONT: I think this because otherwise Node will execute the code that comes after the function which relies on the code inside the function.
    if(c.finishLogin() == 0){
        c.announce(MaplePacketCreator.getAuthSuccess(c));
    }else{
        console.log("AcceptToSHandler finishLogin != 0");
        c.announce(MaplePacketCreator.getLoginFailed(9));
    }
};

AcceptToSHandler.prototype.toString = function(){
      return "AcceptToSHandler";
};

AcceptToSHandler.prototype.validateState = function(client){
    return true;
};

module.exports = AcceptToSHandler;