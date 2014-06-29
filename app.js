var net = require('net');

// import classes to be used
var MapleClient = require('./src/MapleClient.js');
var MapleAESOFB = require('./src/MapleAESOFB.js');
var MaplePacketCreator = require('./src/MaplePacketCreator.js');
var MaplePacketHandler = require('./src/MaplePacketHandler.js');

var HOST = '127.0.0.1';
var PORT = 8484;
var MAPLEVERSION = 83;

///*




// TODO initialize login MaplePacketHandlers
// loop through all opcodes searching for the largest byte value of the opcode
// initialize an array object called handlers with size maxOpcodes+1

//register handlers as in reset

// TODO initialize channel MaplePacketHandlers


var server = net.createServer();
server.listen(PORT, HOST);


// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {

    // handle first connection stuff. If this is called multiple times by the same client I'll need to add more logic)
    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');
    firstConnect(sock);

    sock.on('data', function(data) {
        var b = new Buffer(0);
        b = Buffer.concat([b,data]);
        console.log('Data received from ' + sock.remoteAddress);

        for( var i=0; i< b.length; i++){
                console.log(b[i]);
        }

        // read the short to determine the packetID/opcode
        // TODO verify this works
        var opcode = b[0] + (b[1] << 8);
        var client = MapleClient.getClient(sock);
        // get an already initialized handler
        var packetHandler = MaplePacketHandler.getHandler(opcode);
        if ((packetHandler != null) && packetHandler.validateState(client)){
            // handle the packet not including the opcode
            var packet = b.slice(2, b.length);

            console.log("printing packet");
            for(var i = 0; i<packet.length; i++){
                console.log(packet[i]);
            }


            //TODO check to see that packetHandler returns a different handler such that the handler returned has a method called handledPacket
            packetHandler.handlePacket(packet, client);
        }


    });

    sock.on('close', function(data) {
        console.log(sock.remoteAddress +':'+ sock.remotePort+' has disconnected with data: '+data);
    });


}).listen(PORT, HOST);
console.log('Server hosted on ' + HOST +':'+ PORT);
//*/

//console.log("Checking MapleAESOFB toString: \n" );
//firstConnect("this is a string instead of a sock");

function firstConnect(sock){

    var key =  new Buffer(
        [0x13, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x06, 0x00, 0x00, 0x00, 0xB4, 0x00, 0x00, 0x00,
        0x1B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
        0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00]);

    var ivRecv = new Buffer([70, 114, 122, 82]);
    var ivSend = new Buffer([82, 48, 120, 115]);

    ivRecv[3] = Math.random() * 255;
    ivSend[3] = Math.random() * 255;

    var sendCypher = new MapleAESOFB(key, ivSend, MAPLEVERSION , true);
    console.log("sendCypher toString: "+sendCypher);
    var recvCypher = new MapleAESOFB(key, ivRecv, MAPLEVERSION, false);
    console.log("recvCypher toString: "+recvCypher);

    var client = new MapleClient(sendCypher, recvCypher, sock);
    //console.log("client toString: "+client);

    // initialize clients to have login server attributes
    client.setWorld(-1);
    client.setChannel(-1);

    var unencryptedPackets = MaplePacketCreator.getHello(MAPLEVERSION, ivSend, ivRecv);

//    console.log("unencrypted packets: ");
//    for(var i=0; i<unencryptedPackets.length; i++) {
//        console.log(unencryptedPackets[i]);
//    }

    write(sock, unencryptedPackets);

    // NOTE: I am not setting attributes to the socket yet
//    sock.setAttribute(MapleClient.CLIENT_KEY, client);
}

function write(sock, packets){

    // TODO maybe do some packet encoding/decoding later
   sock.write(packets);
    console.log("packets have been written");
}


