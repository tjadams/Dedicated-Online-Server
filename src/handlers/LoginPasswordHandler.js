/**
 * Created by Tyler Adams on 29/06/2014.
 */
var MaplePacketCreator = require('../MaplePacketCreator');

 var LoginPasswordHandler = function(){

};


LoginPasswordHandler.prototype.handlePacket = function(packet, c){
    // TODO NOTE I HAVENT CODED PASSWORD HASHING YET
    // TODO add ban logic
    // TODO NOTE MINIMUM MAPLESTORY PWD LENGTH IS 5

    var login = MaplePacketCreator.readMapleAsciiString(packet);

    // slice opcode and login string
    packet = packet.slice(2 + login.length,packet.length);
    var pwd = MaplePacketCreator.readMapleAsciiString(packet);
    c.setAccountName(login);
    c.loginMaple(login, pwd);
    // NOTE: the rest of this handler is contained blocking-ly in the non-blocking mySql connection
    // method inside c.loginMaple();

    // TODO I should go through this entire code updating clients and etc since Javascript probably
    // todo isn't pass by reference

};

LoginPasswordHandler.prototype.validateState = function(client){
     return true;
};

LoginPasswordHandler.prototype.toString = function(){
    return "LoginPasswordHandler";
};

module.exports = LoginPasswordHandler;