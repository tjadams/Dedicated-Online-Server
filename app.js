var net = require('net');

// import classes to be used
var MapleClient = require('./src/MapleClient.js');
var MapleAESOFB = require('./src/MapleAESOFB.js');

var HOST = '127.0.0.1';
var PORT = 8484;
var MAPLEVERSION = 83;

var server = net.createServer();
server.listen(PORT, HOST);


// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {


    // handle first connection stuff (if this is called multiple times I'll need to add more logic)

    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');

    firstConnect(sock);

    sock.on('data', function(data) {

        console.log('Data received from' + sock.remoteAddress + ': ' + data);

        // write back to the socket
        //sock.write();
    });

    sock.on('close', function(data) {
        console.log(this.remoteAddress +':'+ this.remotePort+' has disconnected with data: '+data);
    });


}).listen(PORT, HOST);
console.log('Server hosted on ' + HOST +':'+ PORT);

console.log("Testing firstConnect: \n" );
firstConnect("this is a string instead of a sock");






function firstConnect(sock){

    var key =  new Buffer(
        [0x13, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x06, 0x00, 0x00, 0x00, 0xB4, 0x00, 0x00, 0x00,
        0x1B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
        0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00]);

    var ivRecv = new Buffer([70, 114, 122, 82]);
    var ivSend = new Buffer([82, 48, 120, 115]);

    // randomize part of the initialization vector
    ivRecv[3] = Math.random() * 255;
    ivSend[3] = Math.random() * 255;

    // TODO investigate (short) cast
    var sendCypher = new MapleAESOFB(key, ivSend, (0xFFFF - MAPLEVERSION));
    console.log("sendCypher toString: "+sendCypher);
    var recvCypher = new MapleAESOFB(key, ivRecv, (MAPLEVERSION));
    console.log("recvCypher toString: "+recvCypher);

    var client = new MapleClient(sendCypher, recvCypher, sock);
    //console.log("client toString: "+client);

    // initialize clients to have login server attributes
    client.setWorld(-1);
    client.setChannel(-1);

    //console.log("World: "+client.world +"  Channel:"+ client.channel);

    //TODO: after I have ran sample code and everything is equal up to this point,
    //TODO: write these next two lines and then compare again before actually sending

//    sock.write(MaplePacketCreator.getHello(MAPLEVERSION, ivSend, ivRecv));
    // TODO create a method that encodes the sent bytes
//    sock.setAttribute(MapleClient.CLIENT_KEY, client);

}

