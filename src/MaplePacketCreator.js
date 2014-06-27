/**
 * Created by Tyler Adams on 26/06/2014.
 */

function MaplePacketCreator()  {


};

var getHello = function (MAPLEVERSION, ivSend, ivRecv) {
    // create a buffer that will have a size of 8 bytes
//    var buffer = new Buffer(16, "ucs2");
        var buffer = new Buffer(16);
//    buffer = writeShort(0x0E, buffer);

    // TODO investigate buffer.write()
    console.log("short & 0xFF: " + ((0x0E) & 0xFF));

//    logBuffer("writeShort",buffer);
    buffer = writeShort(MAPLEVERSION, buffer);
//    logBuffer("writeShort",buffer);

    buffer = writeShort(1, buffer);
//    logBuffer("writeShort",buffer);

    buffer = write(49, buffer);
//    logBuffer("write",buffer);

    buffer = writeArray(ivRecv, buffer);
//    logBuffer("writeArray",buffer);

    buffer = writeArray(ivSend, buffer);
//    logBuffer("writeArray",buffer);

    buffer = write(8, buffer);
//    logBuffer("write",buffer);

    // create packet from buffer by converting buffer to a byte array
/*    var array = [buffer.length];
    for(var i=0; i<buffer.length; i++) {
        array[i]=buffer[i];
    }

    return array;
    */
//    console.log("Buffer.length = "+buffer.length);
    return buffer;
};

function writeShort(short, buffer){
//    buffer.write("" + (short & 0xFF), "ucs2");
//    buffer.write(""+ ((short >>> 8)& 0xFF), "ucs2");
var x = short & 0xFF;
    var y= "";
    y = x.concat(y);
    buffer.write(y);

//    buffer.write("" + (short & 0xFF));

   x = ((short >>> 8)& 0xFF);
   y = "";
    y = x.concat(y);
    buffer.write(y);
//    buffer.write(""+ ((short >>> 8)& 0xFF));
    return buffer;
//    this.buffer = buffer;
};

function writeArray(byteArray, buffer){
    for(var i=0; i<byteArray.length; i++)
    {
        buffer.write(""+byteArray[i]);
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
//    buffer.write(""+byte, "ucs2");

    buffer.write(""+byte);

    return buffer;
//    this.buffer = buffer;
};

// required for importing a "static method" as in Java
module.exports = {
    getHello: getHello
};