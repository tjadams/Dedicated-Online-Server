var net = require('net');
var mysql = require('mysql');

// import classes to be used
var MapleClient = require('./src/MapleClient.js');
var MapleAESOFB = require('./src/MapleAESOFB.js');
var MaplePacketCreator = require('./src/MaplePacketCreator.js');
var RecvOpcode = require('./src/RecvOpcode.js');

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
    });

    // TODO add extra initial connection stuff

    connection.end();
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

// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {

    // handle first connection stuff. If this is called multiple times by the same client I'll need to add more logic)
    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');
    firstConnect(sock);

    sock.on('data', function(data) {
        var b = new Buffer(0);
        b = Buffer.concat([b,data]);
        console.log('Data received from ' + sock.remoteAddress);

//        for( var i=0; i< b.length; i++){
//                console.log(b[i]);
//        }

        // read the short to determine the packetID/opcode
        // TODO verify these 3 lines work
        var opcode = b[0] + (b[1] << 8);
        console.log("opcode short: "+opcode+"    Opcode bytes: "+b[0]+" "+b[1]);
        var client;
        for( var i = 0; i < clients.length; i++ ){
            if(clients[i].session == sock){
                // get the client associated with the socket
                client = clients[i];
            }
        }

//        console.log("client: "+client.session);
        // get an already initialized handler
//        var packetHandler = MaplePacketHandler.getHandler(opcode);
//        if ((packetHandler != null) && packetHandler.validateState(client)){

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
                var packet = b.slice(2, b.length);

//                console.log("printing packet");
//                for (var i = 0; i < packet.length; i++) {
//                    console.log(packet[i]);
//                }


                //I DONT THINK I NEED THIS TODO ANYMORE ... check to see that packetHandler returns a different handler such that the handler returned has a method called handledPacket
                packetHandler.handlePacket(packet, client);
            }
        }
        else{
            console.log("not registered: "+opcode);
        }

    });

    sock.on('close', function(data) {
        // remove the client from the list of clients
        for(var i = 0; i < clients.length; i++){
            if(clients[i].session == sock){
                // remove from arraylist
                clients.pop(clients[i]);
            }
        }

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

//    ivRecv[3] = Math.random() * 255;
//    ivSend[3] = Math.random() * 255;

    var sendCypher = new MapleAESOFB(key, ivSend, MAPLEVERSION , true);
    console.log("sendCypher toString: "+sendCypher);
    var recvCypher = new MapleAESOFB(key, ivRecv, MAPLEVERSION, false);
    console.log("recvCypher toString: "+recvCypher);

    var client = new MapleClient(sendCypher, recvCypher, sock);

    clients.push(client);
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