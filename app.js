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
var World = require('./src/world.js');
var Channel = require('./src/Channel.js');

// TODO add inheritance
//var MaplePacketHandler = require('./src/MaplePacketHandler.js');
var LoginPasswordHandler = require('./src/handlers/LoginPasswordHandler.js');
var AcceptToSHandler = require('./src/handlers/AcceptToSHandler.js');
var AfterLoginHandler = require('./src/handlers/AfterLoginHandler.js');
var ServerlistRequestHandler = require('./src/handlers/ServerlistRequestHandler.js');
var ServerStatusRequestHandler = require('./src/handlers/ServerStatusRequestHandler.js');

var HOST = '127.0.0.1';
var PORT = 8484;
var MAPLEVERSION = 83;

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

//todo add these lines to a server.onDestroy() as in Android  to close this connection and probably all the ones for all the connected clients
//        connection.end();
//        console.log("Finished mySQL connection.");
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
handlers[RecvOpcode.opcodes.SERVERLIST_REQUEST] = new ServerlistRequestHandler();
handlers[RecvOpcode.opcodes.SERVERSTATUS_REQUEST] = new ServerStatusRequestHandler();
// TODO initialize channel MaplePacketHandlers

// TODO I need something like a TimerManager to constantly update the MapRespawn

// TODO load skills and items from .wz files




var server = net.createServer();
server.listen(PORT, HOST);


// TODO use a better data structure to handle the clients
var clients = [];
var decryptedPacket;
var beingDecrypted;

var client;
var instance = this;

exports.getWorlds = function(){
   return worlds;
};

exports.getHOST = function(){
    return HOST;
};

exports.getClients = function(){
    return clients;
};

exports.getInstance = function(){
    return instance;
};

// todo load worlds and channels
// loading worlds (only one for now)
var worlds = [1];
// worldID, flag, eventmessage, exprate,droprate, mesorate, bossdroprate
worlds[0] = new World(0, 2, "heyyo", 1, 1, 1, 1);
var ch = new Channel(0,1);
ch.init();
worlds[0].addChannel(ch);
console.log("done loading world 0");
exports.worldRecommendedList = worlds;



// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {

    // handle first connection stuff. If this is called multiple times by the same client I'll need to add more logic)
    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');
    firstConnect(sock);

    sock.on('data', function(data) {
        console.log('Data received from ' + sock.remoteAddress);
        // get the client associated with the socket
        for (var i = 0; i < clients.length; i++) {
            if (clients[i].session == sock) {
                client = clients[i];
            }
        }
        // new decryption session
        decryptedPacket = -1;
        var dontDecode = false;

        var decodeTimes = 0;
        //Before I get the opcode, I need to decode the buffer and get the decryptedPacket
        // if it ever returns true then it will break out of the loop
        while (!dontDecode) {
            dontDecode = doDecode(data, client);
            console.log("decodeTimes: "+ (decodeTimes++));
        }

//        sock.pause();
        handleDecodedPackets();
//        sock.resume();
    });

    sock.on('error', function() {
        console.error("error:");
        console.error("%j", arguments);

//        sock.end();
//        sock.destroy();
    });

    sock.on('close', function(data) {
        // remove this client from the list of connected clients
        for(var i = 0; i < clients.length; i++){
            if(clients[i].session == sock){
//                sock.end();
//                sock.destroy();
                console.log(sock.remoteAddress +':'+ sock.remotePort+' has disconnected with data: '+data);
                clients = _.without(clients,clients[i]);
            }
        }
      });


}).listen(PORT, HOST);
console.log('Server hosted on ' + HOST +':'+ PORT);
//*/

function handleDecodedPackets(){
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
//    console.log("packetHandler is: "+packetHandler);
    if(registered) {
        if (packetHandler.validateState(client)) {
            // handle the packet not including the opcode
            var packet = decryptedPacket.slice(2, decryptedPacket.length);

//            console.log("\nPrinting decrypted packet content");
//            for(var i  = 0; i <decryptedPacket.length; i++){
//                console.log(decryptedPacket[i]);
//            }

            packetHandler.handlePacket(packet, client);
        }
    }
    else{
        console.log("not registered: "+opcode);
    }
}




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

    var client = new MapleClient(sendCypher, recvCypher, sock, connection);
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
    var decoderState = client.getDecoderState();
    var decoderPacketLength = client.getDecoderPacketLength();

    // new decoding session
    if (decoderState == false) {
        decoderState = true;
    }else{
        buffer = beingDecrypted;
    }
    // we have enough byte length in the Buffer for a header and the decoder has recently been initialized
    if (buffer.length >= 4 && decoderPacketLength == -1) {

        // get the integer and slice the buffer after that

//       var packetHeader = (buffer[0] & 0xFF) + ((buffer[1] & 0xFF) << 8) + ((buffer[2]  & 0xFF) << 16) + ((buffer[3] & 0xFF) << 24) ;      // huge number starting with 13
//       var packetHeader = (buffer[0] & 0xFF) + ((buffer[1] & 0xFF) >> 8) + ((buffer[2]  & 0xFF) >> 16) + ((buffer[3] & 0xFF) >> 24) ; // 41

//        var packetHeader = buffer.readInt8(0);
//        var packetHeader = (buffer.readInt8(0) & 0xFF) + ((buffer.readInt8(0) & 0xFF) << 8) + ((buffer.readInt8(0)  & 0xFF) << 16) + ((buffer.readInt8(0) & 0xFF) << 24) ;

           // these lines below work seperately
//        var packetHeader = buffer.readInt32BE(0);
       var packetHeader = (buffer[3] & 0xFF) + ((buffer[2] & 0xFF) << 8) + ((buffer[1]  & 0xFF) << 16) + ((buffer[0] & 0xFF) << 24) ;

        console.log("\ndoDecode packetHeader: "+packetHeader);
    //  without this line I think it loops forever because the buffer never decreases in size
        buffer = buffer.slice(4, buffer.length);



        // note: sendCrypto this.iv was probably modified so receiveCrypto may need the same iv
//        NO THIS IS WRONG client.receive.iv = client.send.iv;

        // check to see if the header of this packet contains information we want
        // in this case, we are calling the int version of checkPacket
        if (!client.getReceiveCrypto().checkPacketInt(packetHeader)) {
//            console.log("\n\nDestroying socket session with client: "+client.session.remoteAddress+" due to packetHeader: "+packetHeader);
//            client.session.destroy();
            // NOTE: removing the session destruction allowed me to ignore packetHeader -738843410 and move on to the worlds screen
            console.error("NOTE: packetHeader is invalid, potential error.");
            decoderState = false;
            updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
            return false;
        }
        // the length of the packet data not including header
        decoderPacketLength = MapleAESOFB.getPacketLength(packetHeader);
//        console.log("decoderPacketLength: " +decoderPacketLength);
    } else if (buffer.length < 4 && decoderPacketLength == -1) {
        decoderState = false;
        updateDecodeValues(client, decoderState, decoderPacketLength, buffer);
        return false;
    }
    // read the rest of the packet
    if (buffer.length >= decoderPacketLength) {
        // get the whole packet from the Buffer by filling in the byte array from 0 to decoderPacketlength
       decryptedPacket = [decoderPacketLength];
//        console.log("doDecode decryptedPacket: ");
        for( var i  = 0; i<decoderPacketLength; i++){
             decryptedPacket[i] = buffer[i];
//            console.log(buffer[i]);
        }
        // set it to re-initialized state
        decoderPacketLength = -1;

        // TODO Both lines are needed to properly decrypt.
       decryptedPacket = client.getReceiveCrypto().crypt(decryptedPacket);

//        console.log("doDecode decryptedPacket crypt: ");
//        for( var i  = 0; i<decryptedPacket.length; i++){
//            console.log(decryptedPacket[i]);
//        }
       decryptedPacket = MapleCustomEncryption.decryptData(decryptedPacket);

//        console.log("\ndoDecode finished decryptedPacket decryptData: \n");
//        for( var i  = 0; i<decryptedPacket.length; i++){
//            console.log(decryptedPacket[i]);
//        }
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
      beingDecrypted = buffer;
    // update this client in the array of clients because I dont think javascript passes by reference
    // TODO verify this works
    for( var i = 0; i < clients.length; i++ ){
        if(client.session == clients[i].session){
            clients[i] = client;
        }
    }
}


function write(sock, packets){
// todo Looks like firstConnect doesn't need to be encrypted.
   sock.write(packets);
   console.log("Wrote to client: "+sock.remoteAddress+":"+sock.remotePort);
}