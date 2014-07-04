exports.values = {
    // TODO add more opcodes for v83
    LOGIN_NOTLOGGEDIN: 0,
    LOGIN_SERVER_TRANSITION: 1,
    LOGIN_LOGGEDIN: 2
};


var MapleClient = module.exports = function MapleClient(sendCypher, recvCypher, sock) {
    this.send = sendCypher;
    this.receive = recvCypher;
    this.session = sock;
    this.pinattempt = 0;
};


MapleClient.prototype.toString = function () {
    return ("" + this.session + " " + this.send + " " + this.receive);
};

MapleClient.prototype.setWorld = function (world) {
    this.world = world;
};

MapleClient.prototype.setChannel = function (channel) {
    this.channel = channel;
};

MapleClient.prototype.announce = function (packet){
    this.session.write(packet);
};

MapleClient.prototype.getPin = function(){
    return this.pin;
};

MapleClient.prototype.setPin = function(pin){
    this.pin = pin;
};

MapleClient.prototype.checkPin = function(pin){
   pinattempt = pinattempt + 1;
   if(pinattempt > 5){
       // destroy the socket connection
       this.session.destroy();
   }

    if(this.pin == pin){
        pinattempt = 0;
        return true;
    }
    return false;
};

MapleClient.prototype.updateLoginState = function(state){

};

MapleClient.prototype.setDecoderState = function(decoderState){
    this.decoderState = decoderState;
};

MapleClient.prototype.setDecoderPacketLength = function(decoderPacketLength){
    this.decoderPacketLength = decoderPacketLength;
};

MapleClient.prototype.getDecoderPacketLength = function(){
    return this.decoderPacketLength;
};


MapleClient.prototype.getDecoderState = function(){
    return this.decoderState;
};

module.exports = MapleClient;