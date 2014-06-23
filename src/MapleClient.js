function MapleClient(sendCypher, recvCypher, sock) {
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

// required for "importing this class" as in Java
module.exports = MapleClient;