/**
 * Created by Tyler Adams on 26/06/2014.
 */


// NOTE: buffer.write() was giving me incorrect values. Buffer.concat() works better.
function MaplePacketCreator()  {

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

function writeShort(short, buffer){
    var temp = new Buffer(2);
    temp[0] = "" + (short & 0xFF);
    temp[1] = "" + ((short >>> 8)& 0xFF);
    // append to the end of the buffer
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
}

function write(byte, buffer){
    var temp = new Buffer(1);
    temp[0] = "" + (byte);
    buffer = Buffer.concat([buffer,temp]);

    return buffer;
};

// required for importing a method as in Java
module.exports = {
    getHello: getHello
};