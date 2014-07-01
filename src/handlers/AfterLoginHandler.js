/**
 * Created by Tyler Adams on 29/06/2014.
 */

    function AfterLoginHandler(){

};
exports.handlePacket = function(packet, client){
    console.log("AfterLoginHandler handlePacket");
};
                           // TODO EDIT ALL LOGIC
exports.validateState = function(client){
    return true;
};

module.exports = AfterLoginHandler;