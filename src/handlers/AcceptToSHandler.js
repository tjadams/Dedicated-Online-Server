var MaplePacketCreator = require('../MaplePacketCreator.js');
var q = require('q');

/**
 * Created by Tyler Adams on 29/06/2014.
 */

function AcceptToSHandler(){

};

// TODO EDIT ALL LOGIC
AcceptToSHandler.prototype.handlePacket = function(packet, client){
//    console.log("AcceptToSHandler handlePacket");
    var c = client;
    var finishedLogin, isToSAccepted = false;
    var acceptToSPromise = q.fcall(client.acceptToS());
    acceptToSPromise().then(function (results){
        console.log("acceptToSHandler results: "+results);
        isToSAccepted = results;
    }).then( function (results){
        var loginPromise = q.fcall(client.finishLogin());
        loginPromise().then(function (results){
            finishedLogin = results;
            if((packet.length != 0) || MaplePacketCreator.readByte(packet) != 1 || isToSAccepted){
                c.session.destroy();
                console.log("what is going on here");
                return;
            }

            if(finishedLogin == 0){
                c.announce(MaplePacketCreator.getAuthSuccess(c));
            }else{
                console.log("AcceptToSHandler finishLogin != 0");
                c.announce(MaplePacketCreator.getLoginFailed(9));
            }

        }).catch(function (error){
            console.error('acceptToSHandler inner promise error: '+error);
        }).done();
    }).catch(function (error){
        console.error('acceptToSHandler promise error: '+error);
    }).done();
};

AcceptToSHandler.prototype.toString = function(){
      return "AcceptToSHandler";
};

AcceptToSHandler.prototype.validateState = function(client){
    return true;
};

module.exports = AcceptToSHandler;