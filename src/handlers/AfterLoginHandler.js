/**
 * Created by Tyler Adams on 29/06/2014.
 */

var MaplePacketCreator = require('../MaplePacketCreator.js');
var MapleClient = require('../MapleClient.js');

function AfterLoginHandler(){

};

// DISCLAIMER: handlePacket logic was discovered by packet sniffing from the original Global MapleStory server.
// Specifically, this byte manipulation logic (c1, c2, c3) was found/sniffed by
// various members of the MapleStory Private Server development community such as the
// OdinMS dev team and I credit them with that.

AfterLoginHandler.prototype.handlePacket = function(packet, client){
    console.log("AfterLoginHandler handlePacket");

    // TODO packet must be a Buffer.
    //byte
    var c2 = packet[0];
    //pop this byte
    packet.slice(1,packet.length);
     //byte
    var c3 = 5;
    if (packet.length > 0) {
        c3 = packet[0];
        //pop this byte
        packet.slice(1,packet.length);

    }
    if (c2 == 1 && c3 == 1) {
        if (client.getPin() == null) {
            // TODO also need to code RegisterPin and RegisterPic handlers
            client.announce(MaplePacketCreator.registerPin());
        } else {
            client.announce(MaplePacketCreator.requestPin());
        }
    } else if (c2 == 1 && c3 == 0) {

        var pin = MaplePacketCreator.readMapleAsciiString(packet);
         // NOTE: usually, I would need to pop/slice the packets but there are no other calls to the buffer after this so I don't need to

        if (client.checkPin(pin)) {
            client.announce(MaplePacketCreator.pinAccepted());
        } else {
            client.announce(MaplePacketCreator.requestPinAfterFailure());
        }
    } else if (c2 == 2 && c3 == 0) {
        var pin = MaplePacketCreator.readMapleAsciiString(packet);
        // NOTE: usually, I would need to pop/slice the packets but there are no other calls to the buffer after this so I don't need to
        if (client.checkPin(pin)) {
            client.announce(MaplePacketCreator.registerPin());
        } else {
            client.announce(MaplePacketCreator.requestPinAfterFailure());
        }
    } else if (c2 == 0 && c3 == 5) {
        client.updateLoginState(MapleClient.values.LOGIN_NOTLOGGEDIN);
    }

};

// TODO EDIT ALL LOGIC
AfterLoginHandler.prototype.validateState = function(client){
    return true;
};

AfterLoginHandler.prototype.toString = function(){
    return "AfterLoginHandler";
};

module.exports = AfterLoginHandler;