/**
 * Created by Tyler Adams on 26/06/2014.
 */

function MaplePacketCreator()  {

}

MaplePacketCreator.prototype.getHello = function (MAPLEVERSION, ivSend, ivRecv) {
    // create a buffer that will have a size of 8 bytes
    var buffer = new Buffer("ucs2");
    writeShort(0x0E, buffer);
    writeShort(mapleVersion, buffer);
    writeShort(1, buffer);
    write(49, buffer);
    write(recvIv, buffer);
    write(sendIv, buffer);
    write(8, buffer);


    // TODO create packet from buffer by converting buffer to a byte array
};

MaplePacketCreator.prototype.writeShort = function(short, buffer){
    write(short & 0xFF, buffer);
    write((short >>> 8)& 0xFF, buffer);
    this.buffer = buffer;
}

function write(byte, buffer){
   // TODO use the nodejs library for writing to a buffer


    this.buffer = buffer;
}

// required for "importing this class" as in Java
module.exports = MaplePacketCreator;
