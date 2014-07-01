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

exports.getClient = function (sock){
    if(sock == this.sock){
        return this;
        // return MapleClient
    }
};

// required for "importing this class and it's prototype methods" as in Java
module.exports = MapleClient;
