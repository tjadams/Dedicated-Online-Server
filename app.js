var net = require('net');
var mysql = require('mysql');
// using underscore for clean and speedy arraylist removal
var _ =require('underscore');

// import classes to be used
var MapleClient = require('./src/MapleClient.js');
var MapleAESOFB = require('./src/MapleAESOFB.js');
var MaplePacketCreator = require('./src/MaplePacketCreator.js');
var RecvOpcode = require('./src/RecvOpcode.js');
var MapleCustomEncryption = require('./src/MapleCustomEncryption.js');

//var MaplePacketHandler = require('./src/MaplePacketHandler.js'); // TODO add inheritance
var LoginPasswordHandler = require('./src/handlers/LoginPasswordHandler.js');
var AcceptToSHandler = require('./src/handlers/AcceptToSHandler.js');
var AfterLoginHandler = require('./src/handlers/AfterLoginHandler.js');

var HOST = '127.0.0.1';
var PORT = 8484;
var MAPLEVERSION = 83;


// TODO current: AfterLoginHandler class


///*

// oh noez you know my secrets!
var connection = mysql.createConnection({
   host : 'localhost',
   user: 'root',
   password: 'root',
   port: '3306',
   // creative database name eh?
   database: 'root'
});

var isCon = false;
connection.connect(function(err) {
    isCon = true;
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('mySQL database connected as id ' + connection.threadId);

    // TODO this looks like bad practise...
    connection.query("UPDATE accounts SET loggedin = 0", function(err, results) {
        if(err){
            console.error(' back to 2007 we go!!');
        }else{
            console.log("UPDATE loggedin results: "+results);
        }

        connection.end();
        console.log("Finished mySQL connection.");
    });

    // TODO add extra initial connection stuff

});



// loop through all opcodes searching for the largest byte value of the opcode
var maxRecvOp = 0;

// get an array of opcodes
var opcodes = RecvOpcode.getOpcodes();

// this next loop is old school MSPS logic thanks to kevintjuh93 and OdinMS devs
// it searchs for the opcode with the largest byte value for easy accessing with enums
for(var i = 0; i < opcodes.length; i++){
    // opcodes[i] represents the byte value of the opcode
    if(opcodes[i] > maxRecvOp){
        maxRecvOp = opcodes[i];
    }
}

// initialize an array object called handlers with size maxOpcodes+1 so that we can easily pass in the byte value of the opcode to the array to locate the specific PacketHandler
var handlers = [maxRecvOp + 1];

handlers[RecvOpcode.opcodes.LOGIN_PASSWORD] = new LoginPasswordHandler();
handlers[RecvOpcode.opcodes.ACCEPT_TOS] = new AcceptToSHandler();
handlers[RecvOpcode.opcodes.AFTER_LOGIN] = new AfterLoginHandler();

// TODO initialize channel MaplePacketHandlers

// TODO I need something like a TimerManager to constantly update the MapRespawn

// TODO load skills and items from .wz files

// todo load worlds and channels

var server = net.createServer();
server.listen(PORT, HOST);


// TODO use a better data structure to handle the clients
var clients = [];
//var ////wasDecoded;
//var bufferData;
var decryptedPacket;
var signed;

// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {

    // handle first connection stuff. If this is called multiple times by the same client I'll need to add more logic)
    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');
    firstConnect(sock);

    sock.on('data', function(data) {
        signed = [data.length];
//        console.log("signed: ");
        // transform all bytes greater than the signed byte range into signed bytes
        for(var i = 0; i<data.length; i++){
            signed[i] = data[i];
            if(signed[i] > 127){
                // subtract a byte (256 bits)
                signed[i] = (signed[i] - 256);

//                console.log(""+signed[i]+" ");
            }
        }
        console.log('Data received from ' + sock.remoteAddress);



        var client;

        // get the client associated with the socket
        for (var i = 0; i < clients.length; i++) {
            if (clients[i].session == sock) {
                client = clients[i];
            }
        }

        // new decryption session
        decryptedPacket = -1;
        var stillDecode = true;

        var decodeTimes = 0;
        //Before I get the opcode, I need to decode the buffer and get the decryptedPacket
        while (stillDecode) {
            stillDecode = doDecode(signed, client);
            console.log("decodeTimes: "+ (decodeTimes++));
        }

        // read the short to determine the packetID/opcode
        if (decryptedPacket == -1) {
            console.log("DECRYPTION FAILED");
        } else {
            var opcode = (decryptedPacket[0] & 0xFF) + ((decryptedPacket[1] & 0xFF) << 8);

//            var opcode = decryptedPacket.readInt16LE(0);
            console.log("opcode short: " + opcode + "    Opcode bytes: " + decryptedPacket[0] + " " + decryptedPacket[1]);
        }

        var registered = false;
        var opcodez = RecvOpcode.getOpcodes();
        var matchedHandler;
        for(var i = 0; i < opcodez.length; i++){
            if(opcode == opcodez[i]){
                registered = true;
                matchedHandler = handlers[opcode];
            }
        }

        var packetHandler = matchedHandler;
        console.log("packetHandler is: "+packetHandler);
        if(registered) {
            if (packetHandler.validateState(client)) {
                // handle the packet not including the opcode
                var packet = decryptedPacket.slice(2, decryptedPacket.length);
                packetHandler.handlePacket(packet, client);
            }
        }
        else{
            console.log("not registered: "+opcode);
        }
    });

    sock.on('close', function(data) {
        // remove this client from the list of connected clients
        for(var i = 0; i < clients.length; i++){
            if(clients[i].session == sock){
                // clients.pop(clients[i]);
                // clients[i].pop();
//                console.log(clients[i].session.remoteAddress +':'+ clients[i].session.remotePort+' has disconnected with data: '+data);
                console.log(sock.remoteAddress +':'+ sock.remotePort+' has disconnected with data: '+data);
                clients = _.without(clients,clients[i]);
            }
        }
      });


}).listen(PORT, HOST);
console.log('Server hosted on ' + HOST +':'+ PORT);
//*/

function firstConnect(sock){
    var key =  new Buffer(
        [0x13, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x06, 0x00, 0x00, 0x00, 0xB4, 0x00, 0x00, 0x00,
        0x1B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
        0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00]);

    var ivRecv = new Buffer([70, 114, 122, 82]);
    var ivSend = new Buffer([82, 48, 120, 115]);

    // TODO randomize IV
//    ivRecv[3] = Math.random() * 255;
//    ivSend[3] = Math.random() * 255;

    var sendCypher = new MapleAESOFB(key, ivSend, MAPLEVERSION , true);
    var recvCypher = new MapleAESOFB(key, ivRecv, MAPLEVERSION, false);

    var client = new MapleClient(sendCypher, recvCypher, sock);
    clients.push(client);

    // initialize clients to have login server attributes
    client.setWorld(-1);
    client.setChannel(-1);
    client.setDecoderState(false);
    client.setDecoderPacketLength(-1);

    var unencryptedPackets = MaplePacketCreator.getHello(MAPLEVERSION, ivSend, ivRecv);
    write(sock, unencryptedPackets);
}

function doDecode(buffer, client)
{

//    console.log("\nbyteArray");
//    for(var i =0; i<buffer.length; i++){
//        console.log(buffer[i] + " ");
//    }

    var decoderState = client.getDecoderState();
    var decoderPacketLength = client.getDecoderPacketLength();

    // new decoding session
    if (decoderState == false) {
        decoderState = true;
    }
    // we have enough byte length in the Buffer for a header and the decoder has recently been initialized
    if (buffer.length >= 4 && decoderPacketLength == -1) {

        // get the integer and slice the buffer after that

//       var packetHeader = (buffer[0] & 0xFF) + ((buffer[1] & 0xFF) << 8) + ((buffer[2]  & 0xFF) << 16) + ((buffer[3] & 0xFF) << 24) ;      // huge number starting with 13
//       var packetHeader = (buffer[0] & 0xFF) + ((buffer[1] & 0xFF) >> 8) + ((buffer[2]  & 0xFF) >> 16) + ((buffer[3] & 0xFF) >> 24) ; // 41
       var packetHeader = (buffer[3] & 0xFF) + ((buffer[2] & 0xFF) << 8) + ((buffer[1]  & 0xFF) << 16) + ((buffer[0] & 0xFF) << 24) ;

//        var packetHeader = buffer.readInt8(0);
//        var packetHeader = (buffer.readInt8(0) & 0xFF) + ((buffer.readInt8(0) & 0xFF) << 8) + ((buffer.readInt8(0)  & 0xFF) << 16) + ((buffer.readInt8(0) & 0xFF) << 24) ;

           // the line below actually works
        // var packetHeader = buffer.readInt32BE(0);
        console.log("\ndoDecode packetHeader: "+packetHeader);
    // TODO without this line I think it loops forever
        buffer = buffer.slice(4, buffer.length);



        // check to see if the header of this packet contains information we want
        // in this case, we are calling the int version of checkPacket
        if (!client.getReceiveCrypto().checkPacketInt(packetHeader)) {
            console.log("Destroying socket session with client: "+client.session.remoteAddress);
            client.session.destroy();
            decoderState = false;
            updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
            return false;
        }
        // the length of the packet data not including header
        // does this include opcode? I hope so!!!
        decoderPacketLength = MapleAESOFB.getPacketLength(packetHeader);
        console.log("decoderPacketLength: " +decoderPacketLength);
    } else if (buffer.length < 4 && decoderPacketLength == -1) {
        decoderState = false;
        updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
        return false;
    }
    // read the rest of the packet
    if (buffer.length >= decoderPacketLength) {
        // get the whole packet from the Buffer by filling in the byte array from 0 to decoderPacketlength
//        decryptedPacket = new Buffer(decoderPacketLength);
//        decryptedPacket = new Buffer(decoderPacketLength);
       decryptedPacket = [decoderPacketLength];
        console.log("doDecode decryptedPacket: ");
        for( var i  = 0; i<decoderPacketLength; i++){
             decryptedPacket[i] = buffer[i];
            console.log(buffer[i]);
        }
        // set it to re-initialized state
        decoderPacketLength = -1;

        // TODO Both lines are needed to properly decrypt.
       decryptedPacket = client.getReceiveCrypto().crypt(decryptedPacket);

        console.log("doDecode decryptedPacket crypt: ");
        for( var i  = 0; i<decryptedPacket.length; i++){
            console.log(decryptedPacket[i]);
        }
       decryptedPacket = MapleCustomEncryption.decryptData(decryptedPacket);

        console.log("doDecode decryptedPacket decryptData: ");
        for( var i  = 0; i<decryptedPacket.length; i++){
            console.log(decryptedPacket[i]);
        }
       updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
       return true;
    }

    updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
    return false;
}

function updateDecodeValues(client, decoderState, decoderPacketLength, buffer){

    client.setDecoderState(decoderState);
    client.setDecoderPacketLength(decoderPacketLength);
    // update the buffer
    signed = buffer;

    // update this client in the array of clients because I dont think javascript passes by reference
    // TODO verify this works
    for( var i = 0; i < clients.length; i++ ){
        if(client.session == clients[i].session){
            clients[i] = client;
        }
    }
}


function write(sock, packets){

    // TODO maybe do some packet encoding/decoding later
   sock.write(packets);
   console.log("Wrote to client: "+sock.remoteAddress+":"+sock.remotePort);
}