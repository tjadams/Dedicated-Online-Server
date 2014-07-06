/**
 * Created by Tyler Adams on 29/06/2014.
 */
 var LoginPasswordHandler = function(){

};


LoginPasswordHandler.prototype.handlePacket = function(packet, client){
    console.log("LoginPassword handlePacket");
};

LoginPasswordHandler.prototype.validateState = function(client){
     return true;
};

LoginPasswordHandler.prototype.toString = function(){
    return "LoginPasswordHandler";
};

module.exports = LoginPasswordHandler;