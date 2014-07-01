/**
 * Created by Tyler Adams on 29/06/2014.
 */
 var LoginPasswordHandler = function(){

};


exports.handlePacket = function(packet, client){
    console.log("LoginPassword handlePacket");
};

exports.validateState = function(client){
     return true;
};


module.exports = LoginPasswordHandler;