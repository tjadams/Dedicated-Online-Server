/**
 * Created by Tyler Adams on 29/06/2014.
 */

    function AfterLoginHandler(){

};
AfterLoginHandler.prototype.handlePacket = function(packet, client){
    console.log("AfterLoginHandler handlePacket");
};
                           // TODO EDIT ALL LOGIC
AfterLoginHandler.prototype.validateState = function(client){
    return true;
};

module.exports = AfterLoginHandler;