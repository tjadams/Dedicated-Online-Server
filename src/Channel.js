/**
 * Created by Tyler Adams on 26/07/2014.
 */
var net = require('net');
var Server = require('../app.js');

var Channel = module.exports = function Channel(worldId, channelId){
    this.world = worldId;
    this.channel = channelId;
    // todo map stuff when doing WZ file stuff, also add map respawn
    this.port = 7575 + this.channel - 1;
    this.port += (this.world * 100);
};

Channel.prototype.getIP = function(){
    return this.address;
};

Channel.prototype.init = function(){

    var tempHost =  Server.getInstance().getHOST();

    this.address = "" +tempHost+  ":" + this.port;
    this.ip = tempHost;

    // start up the server as in app.js but using this.port and this.ip as host
    var HOST = this.ip;
    var PORT = this.port;
    // also set the socket to have tcpnodelay

    this.clients = [];
    this.server = net.createServer();
    this.server.listen(PORT, HOST);
    // todo: Add channel handlers

    this.server.on('connection', function(sock) {

        var connectedClients = Server.getInstance().getClients();
        for(var i = 0; i<connectedClients.length; i++){
            if((connectedClients[i].session.remoteAddress == sock.remoteAddress) &&
                connectedClients[i].session.remotePort == sock.remotePort) {
                this.clients.push(connectedClients[i]);
            }
        }

        console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected to channel' + this.channel + ' on world '+this.world);

        sock.on('data', function(data) {
            console.log('Data received from ' + sock.remoteAddress+' on channel' + this.channel + ' on world '+this.world);
        });

        sock.on('error', function() {
            console.error("Error on channel "+ this.channel + " on world "+this.world+ " :");
            console.error("%j", arguments);
        });

        sock.on('close', function(data) {
            console.log(sock.remoteAddress +':'+ sock.remotePort+' has disconnected with data: '+data);
        });
    }).listen(PORT, HOST);

    this.server.on('error' , function(err){
       console.log(" error starting channel: "+err);
    });

    console.log("Channel "+this.channel+" from "+this.world+" listening on "+this.ip);
};

// todo: ConnectedClients may actually be connected characters, may change this in the future.
Channel.prototype.getConnectedClients = function(){
      return this.clients.length;
};

Channel.prototype.toString = function(){
    return "Channel";
};

module.exports = Channel;