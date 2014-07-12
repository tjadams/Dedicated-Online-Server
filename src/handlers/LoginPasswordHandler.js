/**
 * Created by Tyler Adams on 29/06/2014.
 */
var MaplePacketCreator = require('../MaplePacketCreator');

 var LoginPasswordHandler = function(){

};


LoginPasswordHandler.prototype.handlePacket = function(packet, c){
    var loginok;
    var login = MaplePacketCreator.readMapleAsciiString(packet);
    // TODO may not need slicing here
    var pwd = MaplePacketCreator.readMapleAsciiString(packet.slice(2,packet.length));
    c.setAccountName(login);
    loginok = c.loginMaple(login, pwd);

    // TODO add ban logic
    if (loginok != 0) {
        c.announce(MaplePacketCreator.getLoginFailed(loginok));

        console.log("Account: "+c.getAccountName()+ "login failed");
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