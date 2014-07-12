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

    var loginok;
    var login = MaplePacketCreator.readMapleAsciiString(packet);

    // slice opcode and login string
    packet = packet.slice(2 + login.length,packet.length);
    var pwd = MaplePacketCreator.readMapleAsciiString(packet);
    c.setAccountName(login);
    loginok = c.loginMaple(login, pwd);
    console.log("\n\nloginok="+loginok+"login="+login+"ENDOFLOGINSTRING pwd="+pwd+"ENDOFPWDSTRING");

    if (loginok != 0) {
        console.log("Account: "+c.getAccountName()+ " login failed, most likely disconnecting");
        c.announce(MaplePacketCreator.getLoginFailed(loginok));

        return;
    }
    // successful login
    if (c.finishLogin() == 0) {
        c.announce(MaplePacketCreator.getAuthSuccess(c));
        console.log("Account: "+c.getAccountName()+ "logged in successfuly");
        // TODO add idle client disconnection for logged in clients
    } else {
        c.announce(MaplePacketCreator.getLoginFailed(7));
        console.log("Account: "+c.getAccountName()+ "login failed");
    }
};

LoginPasswordHandler.prototype.validateState = function(client){
     return true;
};

LoginPasswordHandler.prototype.toString = function(){
    return "LoginPasswordHandler";
};

module.exports = LoginPasswordHandler;