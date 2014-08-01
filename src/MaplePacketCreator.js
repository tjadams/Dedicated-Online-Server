/**
 * Created by Tyler Adams on 26/06/2014.
 */

var SendOpcode = require('./SendOpcode.js');
var ServerConstants = require('./ServerConstants.js');
var MapleInventoryType = require('./MapleInventoryType.js');
var MapleInventory = require('./MapleInventory.js');


// NOTE: buffer.write() was giving me incorrect values. Buffer.concat() works better.
function MaplePacketCreator()  {

};

// int, string, int, stirng,  list<channel>
var getServerList = function(serverId, serverName, flag, eventmsg, channelLoad){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.SERVERLIST , buffer);
    buffer = write(serverId, buffer);
    buffer = writeMapleAsciiString(serverName, buffer);
    buffer = write(flag, buffer);
    buffer = writeMapleAsciiString(eventmsg, buffer);
    // rate modifier
    buffer = write(100, buffer);
    // event xp
    buffer = write(0, buffer);
    // rate modifier
    buffer = write(100, buffer);
    // drop rate
    buffer = write(0, buffer);
    buffer = write(0, buffer);
    buffer = write(channelLoad.length, buffer);
    for (var i = 0; i < channelLoad.length; i++){
        var ch = channelLoad[i];
        buffer = writeMapleAsciiString(serverName + "-" + ch.id, buffer);
        buffer = writeInt((ch.connectedClients * 1200) / ServerConstants.CHANNEL_LOAD, buffer);
        buffer = write(1, buffer);
        buffer = writeShort(ch.id - 1, buffer);
    }
    buffer = writeShort(0, buffer);

    console.log("getServerList values: "+serverId+" "+serverName+" "+flag+" "+eventmsg+" "+channelLoad);
    logBuffer("getServerList", buffer);
    return buffer;

};

var getEndOfServerList = function(){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.SERVERLIST, buffer);
    buffer = write(0xFF, buffer);
    logBuffer("getEndOfServerList", buffer);
    return buffer;
};

var selectWorld = function( world){

   var buffer = new Buffer(0);
   buffer = writeShort(SendOpcode.opcodes.LAST_CONNECTED_WORLD, buffer);
   buffer = writeInt(world, buffer);
    logBuffer("selectWorld", buffer);
   return buffer;
};

// list<pair<integer,string>>
var sendRecommended = function(worlds){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.RECOMMENDED_WORLD_MESSAGE, buffer);
    buffer = write(worlds.length, buffer);//size
//    for (Iterator<Pair<Integer, String>> it = worlds.iterator(); it.hasNext();) {
     for(var i = 0; i < worlds.length; i++){
        var world = worlds[i];
        buffer = writeInt(world.id, buffer);
        buffer = writeMapleAsciiString(world.reccomendedMessage, buffer);
    }

    logBuffer("sendRecommended",buffer);
    return buffer;

};

var getHello = function (MAPLEVERSION, ivSend, ivRecv) {
    // initialize an empty buffer that I can append to
    var buffer = new Buffer(0);
    buffer = writeShort(0x0E, buffer);
    buffer = writeShort(MAPLEVERSION, buffer);
    buffer = writeShort(1, buffer);
    buffer = write(49, buffer);
    buffer = writeArray(ivRecv, buffer);
    buffer = writeArray(ivSend, buffer);
    buffer = write(8, buffer);
    return buffer;
};

var getLoginFailed = function(loginok){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.LOGIN_STATUS, buffer);
    buffer = write(loginok, buffer);
    buffer = write(0, buffer);
    buffer = writeInt(0, buffer);
    return buffer;
};


var getAuthSuccess = function(c){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.LOGIN_STATUS, buffer);
//    console.log(buffer.toArray);
    buffer = writeInt(0, buffer);
    buffer = writeShort(0, buffer);
    buffer = writeInt(c.accId, buffer);
    buffer = write(c.gender, buffer);
    buffer = writeBool(c.gmlevel > 0 , buffer);

    // TODO verifies this gets the short value
    var toWrite = c.gmlevel * 32;

    buffer = write(toWrite > 0x80 ? 0x80 : toWrite, buffer);
    buffer = writeBool(c.gmlevel > 0, buffer);
    buffer = writeMapleAsciiString(c.getAccountName(), buffer);
    buffer = write(0,buffer);
    buffer = write(0,buffer);
    buffer = writeLong(0, buffer);
    buffer = writeLong(0, buffer);
    buffer = writeInt(0, buffer);
    buffer = writeShort(2, buffer);

    logBuffer("\n\n\nin getAuthSuccess", buffer);

    return buffer;
};

var getServerStatus = function(status){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.SERVERSTATUS, buffer);
    buffer = writeShort(status, buffer);

    return buffer;
};

var getCharList = function(c, serverId){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.CHARLIST, buffer);
    buffer = write(0,buffer);
    var chars = c.loadCharacters(serverId);
    buffer = write(chars.length, buffer);

    // for commented chars.length
//    buffer = write(0, buffer);

    var chr;
    for (var i = 0; i<chars.length; i++) {
        chr = chars[i];
        buffer = addCharEntry(buffer, chr, false);
    }
//    if (ServerConstants.ENABLE_PIC) {
//        mplew.write(c.getPic() == null || c.getPic().length() == 0 ? 0 : 1);
//    } else {
        buffer = write(2, buffer);
//    }

    buffer = writeInt(c.characterSlots, buffer);
    return buffer;

};

function addCharEntry(buffer, chr, viewall){
    buffer = addCharStats(buffer, chr);
    buffer = addCharLook(buffer, chr, false);
    if (!viewall) {
        buffer = write(0,buffer);
    }
    if (chr.gmlevel > 0) {
        buffer = write(0, buffer);
        return;
    }
    buffer = write(1, buffer); // world rank enabled (next 4 ints are not sent if disabled) Short??
    buffer = writeInt(chr.rank, buffer); // world rank
    buffer = writeInt(chr.rankMove, buffer); // move (negative is downwards)
    buffer = writeInt(chr.jobRank, buffer); // job rank
    buffer = writeInt(chr.jobRankMove, buffer); // move (negative is downwards)

    return buffer;
};

function addCharStats(buffer, chr){
    buffer = writeInt(chr.id, buffer); // character id

    var unicodeZeroesAtEndOfString = chr.name;
    for(var i = 0; i < 13 - chr.name.length; i++){
        unicodeZeroesAtEndOfString += "\\u0000";
    }
    // todo Test this, it's weird
    buffer = writeAsciiString(unicodeZeroesAtEndOfString, buffer);
    buffer = write(chr.gender, buffer); // gender (0 = male, 1 = female)
    // todo Test this
    buffer = write(chr.skinColor.getId(), buffer); // skin color
    buffer = writeInt(chr.face, buffer); // face
    buffer = writeInt(chr.hair, buffer); // hair

    for (var i = 0; i < 3; i++) {
        // todo add pets
        buffer = writeLong(0, buffer);
    }

    buffer = write(chr.level, buffer); // level
    // todo test this
    buffer = writeShort(chr.job.getId(), buffer); // job
    buffer = writeShort(chr.str, buffer); // str
    buffer = writeShort(chr.dex, buffer); // dex
    buffer = writeShort(chr.int_, buffer); // int
    buffer = writeShort(chr.luk, buffer); // luk
    buffer = writeShort(chr.hp, buffer); // hp (?)
    buffer = writeShort(chr.maxhp, buffer); // maxhp
    buffer = writeShort(chr.mp, buffer); // mp (?)
    buffer = writeShort(chr.maxmp, buffer); // maxmp
    buffer = writeShort(chr.remainingAp, buffer); // remaining ap
    buffer = writeShort(chr.remainingSp, buffer); // remaining sp
    buffer = writeInt(chr.exp, buffer); // current exp
    buffer = writeShort(chr.fame, buffer); // fame
    buffer = writeInt(chr.gachaexp, buffer); //Gacha Exp


    if(chr.map != null){
        chr.mapid = chr.map.getId();
    }

    buffer = writeInt(chr.mapid, buffer); // current map id
    buffer = write(chr.initialSpawnPoint, buffer); // spawnpoint
    buffer = writeInt(0, buffer);

    return buffer;
};

function addCharLook(buffer, chr, mega){
    buffer = write(chr.gender, buffer);
    // todo test
    buffer = write(chr.skinColor.getId(), buffer); // skin color
    buffer = writeInt(chr.face, buffer); // face
    buffer = write(mega ? 0 : 1, buffer);
    buffer = writeInt(chr.hair, buffer); // hair
    buffer = addCharEquips(buffer, chr);

    return buffer;
};



function addCharEquips(buffer, chr){
    var equip = chr.getInventory(MapleInventoryType.values.EQUIPPED);

    for (var i = 0; i < 3; i++) {
        // todo add pets
//        if (chr.getPet(i) != null) {
//            mplew.writeInt(chr.getPet(i).getItemId());
//        } else {
            buffer = writeInt(0, buffer);
//        }
    }
    return buffer;
};

function writeBool(b, buffer){
    buffer = write(b ? 1 : 0, buffer);

        return buffer;
};

function writeMapleAsciiString(s, buffer){
    // TODO verify s.length is recognized as a short
    buffer = writeShort(s.length, buffer);
    buffer = writeAsciiString(s, buffer);
    return buffer;
};

function writeAsciiString(s, buffer){
    buffer = writeArray(getAsciiBytes(s), buffer);
    return buffer;
};

function getAsciiBytes (s,buffer) {
    var bytes = [];

    for (var i = 0; i < s.length; ++i)
    {
        bytes.push(s.charCodeAt(i));
    }

    return bytes;
};

function writeShort(short, buffer){
    var temp = new Buffer(2);
    temp[0] = "" + (short & 0xFF);
    temp[1] = "" + ((short >>> 8)& 0xFF);
    // append to the end of the buffer
    buffer = Buffer.concat([buffer,temp]);

    return buffer;
};

function writeInt(int, buffer){
    var temp = new Buffer(4);
    temp[0] = "" +  (int & 0xFF);
    temp[1] = "" + ((int >>> 8) & 0xFF);
    temp[2] = "" + ((int >>> 16) & 0xFF);
    temp[3] = "" + ((int >>> 24) & 0xFF);
    buffer = Buffer.concat([buffer,temp]);

    return buffer;
};


function writeLong(long, buffer){
    var temp = new Buffer(8);
    temp[0] = "" +  (long & 0xFF);
    temp[1] = "" + ((long >>> 8) & 0xFF);
    temp[2] = "" + ((long >>> 16) & 0xFF);
    temp[3] = "" + ((long >>> 24) & 0xFF);
    temp[4] = "" + (((long >>> 32) & 0xFF));
    temp[5] = "" + (((long >>> 40) & 0xFF));
    temp[6] = "" + (((long >>> 48) & 0xFF));
    temp[7] = "" + (((long >>> 56) & 0xFF));
    buffer = Buffer.concat([buffer,temp]);

    return buffer;

};

function writeArray(byteArray, buffer){
    for(var i=0; i<byteArray.length; i++){
        var temp = new Buffer(1);
        temp[0] = "" + (byteArray[i]);
        buffer = Buffer.concat([buffer,temp]);
    }

    return buffer;
};

function logBuffer (string, buffer){
    console.log(string);
    for( var i =0; i<buffer.length; i++){
        console.log(buffer[i]);
    }
};

function write(byte, buffer){
    var temp = new Buffer(1);
    temp[0] = "" + (byte);
    buffer = Buffer.concat([buffer,temp]);

    return buffer;
};

function registerPin(){
    return pinOperation(1);
};

function pinOperation(mode){
    var buffer = new Buffer(0);
    buffer = writeShort(SendOpcode.opcodes.CHECK_PINCODE, buffer);
    buffer = write(mode, buffer);
    return buffer;
};

function requestPin(){
    return pinOperation(4);
};

    function readMapleAsciiString(packet){
      // the second paramter sends the actual string without the opcode
    return readAsciiString(readShort(packet), packet.slice(2,packet.length));
};

function readShort(packet){
    return ((packet[0] & 0xFF) + ((packet[1] & 0xFF) << 8));
};


function readAsciiString (short, packet){
    var ret = "";
    for (var x = 0; x < short; x++) {
        ret = ret + String.fromCharCode(packet[x]);
    }
    return ret;
};

function pinAccepted(){
    return pinOperation(0);
};

function requestPinAfterFailure(){
    return pinOperation(2);
};

var readByte = function(packet) {
//    var buffer = new Buffer(packet);

    //todo NOTE: for now, readByte does not create a buffer based on an array
    //todo NOTE: for now, readByte does not slice off the byte that is read from the array, the user of this method must handle that if necessary
    //todo my Endianness may be wrong. I think it's correct because of how I receive the short value of the opcode in app.js
    if(packet.length != 0){
        return packet[0];
    }
    return null;
};

// required for importing a method as in Java
module.exports = {
    getHello: getHello,
    registerPin: registerPin,
    requestPin: requestPin,
    readMapleAsciiString: readMapleAsciiString,
    pinAccepted: pinAccepted ,
    requestPinAfterFailure: requestPinAfterFailure,
    getLoginFailed: getLoginFailed,
    getAuthSuccess: getAuthSuccess,
    readByte: readByte,
    selectWorld: selectWorld,
    sendRecommended: sendRecommended,
    getServerList: getServerList,
    getEndOfServerList: getEndOfServerList,
    readShort: readShort,
    getServerStatus: getServerStatus,
    getCharList: getCharList

};