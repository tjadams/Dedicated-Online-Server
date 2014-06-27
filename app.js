var net = require('net');

// import classes to be used
var MapleClient = require('./src/MapleClient.js');
var MapleAESOFB = require('./src/MapleAESOFB.js');
var MaplePacketCreator = require('./src/MaplePacketCreator.js');

var HOST = '127.0.0.1';
var PORT = 8484;
var MAPLEVERSION = 83;

/*
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
*/
console.log("Checking helloPacket: \n" );
firstConnect("this is a string instead of a sock");






function firstConnect(sock){

    var key =  new Buffer(
        [0x13, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x06, 0x00, 0x00, 0x00, 0xB4, 0x00, 0x00, 0x00,
        0x1B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
        0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00]);

    var ivRecv = new Buffer([70, 114, 122, 82]);
    var ivSend = new Buffer([82, 48, 120, 115]);

//    ivRecv[3] = Math.random() * 255;
//    ivSend[3] = Math.random() * 255;

    var sendCypher = new MapleAESOFB(key, ivSend, MAPLEVERSION , true);
//    console.log("sendCypher toString: "+sendCypher);
    var recvCypher = new MapleAESOFB(key, ivRecv, MAPLEVERSION, false);
//    console.log("recvCypher toString: "+recvCypher);

// TODO: verify my cipher in each of the MapleAESOFB objects is correct

    var client = new MapleClient(sendCypher, recvCypher, sock);
    //console.log("client toString: "+client);

    // initialize clients to have login server attributes
    client.setWorld(-1);
    client.setChannel(-1);

    // TODO check the hello packet

    var unencryptedPackets = MaplePacketCreator.getHello(MAPLEVERSION, ivSend, ivRecv);

//    console.log("unencrypted packets: ");
    for(var i=0; i<unencryptedPackets.length; i++) {
//        console.log(unencryptedPackets[i]);
    }

    write(sock, unencryptedPackets);

    // NOTE: I am not setting attributes to the socket yet
//    sock.setAttribute(MapleClient.CLIENT_KEY, client);
}

//encode the sent bytes and then writes them
function write(sock, packets){

    // TODO do some maple packet encoding so the client can recognize these packets
    //packets manipulated;

   // sock.write(packets);
}


