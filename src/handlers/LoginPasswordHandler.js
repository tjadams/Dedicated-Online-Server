/**
 * Created by Tyler Adams on 29/06/2014.
 */
var handlePacket = function(packet, client){
    console.log("LoginPassword handlePacket");
};

var validateState = function(client){
     return true;
};

module.exports = {
    handlePacket: handlePacket,
    validateState: validateState
};