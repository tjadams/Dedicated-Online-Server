var MapleClient = module.exports = function MapleClient(sendCypher, recvCypher, sock) {
    this.send = sendCypher;
    this.receive = recvCypher;
    this.session = sock;
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

module.exports = MapleClient;