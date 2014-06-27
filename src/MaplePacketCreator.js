/**
 * Created by Tyler Adams on 26/06/2014.
 */

function MaplePacketCreator()  {


};

var getHello = function (MAPLEVERSION, ivSend, ivRecv) {
    // create a buffer that will have a size of 8 bytes
    var buffer = new Buffer("ucs2");
    writeShort(0x0E, buffer);
    writeShort(MAPLEVERSION, buffer);
    writeShort(1, buffer);
    write(49, buffer);
    write(ivRecv, buffer);
    write(ivSend, buffer);
    write(8, buffer);

    // create packet from buffer by converting buffer to a byte array
/*    var array = [buffer.length];
    for(var i=0; i<buffer.length; i++) {
        array[i]=buffer[i];
    }

    return array;
    */
    return buffer;
};

function writeShort(short, buffer){
    write(short & 0xFF, buffer);
    write((short >>> 8)& 0xFF, buffer);

    this.buffer = buffer;
};

function write(byte, buffer){
    buffer.write(""+byte, "ucs2");
    this.buffer = buffer;
};

// required for importing a "static method" as in Java
module.exports = {
    getHello: getHello
};