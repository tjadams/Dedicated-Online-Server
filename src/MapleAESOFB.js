var crypto = require('crypto');
var MapleCustomEncryption = require('./MapleCustomEncryption');
//TODO comment my code

var funnyBytes = new Buffer([ 0xEC,  0x3F,  0x77,  0xA4,  0x45,  0xD0,  0x71,  0xBF,  0xB7,  0x98,  0x20,  0xFC,
     0x4B,  0xE9,  0xB3,  0xE1,  0x5C,  0x22,  0xF7,  0x0C,  0x44,  0x1B,  0x81,  0xBD,  0x63,  0x8D,  0xD4,  0xC3,
     0xF2,  0x10,  0x19,  0xE0,  0xFB,  0xA1,  0x6E,  0x66,  0xEA,  0xAE,  0xD6,  0xCE,  0x06,  0x18,  0x4E,  0xEB,
     0x78,  0x95,  0xDB,  0xBA,  0xB6,  0x42,  0x7A,  0x2A,  0x83,  0x0B,  0x54,  0x67,  0x6D,  0xE8,  0x65,  0xE7,
     0x2F,  0x07,  0xF3,  0xAA,  0x27,  0x7B,  0x85,  0xB0,  0x26,  0xFD,  0x8B,  0xA9,  0xFA,  0xBE,  0xA8,  0xD7,
     0xCB,  0xCC,  0x92,  0xDA,  0xF9,  0x93,  0x60,  0x2D,  0xDD,  0xD2,  0xA2,  0x9B,  0x39,  0x5F,  0x82,  0x21,
     0x4C,  0x69,  0xF8,  0x31,  0x87,  0xEE,  0x8E,  0xAD,  0x8C,  0x6A,  0xBC,  0xB5,  0x6B,  0x59,  0x13,  0xF1,
     0x04,  0x00,  0xF6,  0x5A,  0x35,  0x79,  0x48,  0x8F,  0x15,  0xCD,  0x97,  0x57,  0x12,  0x3E,  0x37,  0xFF,
     0x9D,  0x4F,  0x51,  0xF5,  0xA3,  0x70,  0xBB,  0x14,  0x75,  0xC2,  0xB8,  0x72,  0xC0,  0xED,  0x7D,  0x68,
     0xC9,  0x2E,  0x0D,  0x62,  0x46,  0x17,  0x11,  0x4D,  0x6C,  0xC4,  0x7E,  0x53,  0xC1,  0x25,  0xC7,  0x9A,
     0x1C,  0x88,  0x58,  0x2C,  0x89,  0xDC,  0x02,  0x64,  0x40,  0x01,  0x5D,  0x38,  0xA5,  0xE2,  0xAF,  0x55,
     0xD5,  0xEF,  0x1A,  0x7C,  0xA7,  0x5B,  0xA6,  0x6F,  0x86,  0x9F,  0x73,  0xE6,  0x0A,  0xDE,  0x2B,  0x99,
     0x4A,  0x47,  0x9C,  0xDF,  0x09,  0x76,  0x9E,  0x30,  0x0E,  0xE4,  0xB2,  0x94,  0xA0,  0x3B,  0x34,  0x1D,
     0x28,  0x0F,  0x36,  0xE3,  0x23,  0xB4,  0x03,  0xD8,  0x90,  0xC8,  0x3C,  0xFE,  0x5E,  0x32,  0x24,  0x50,
     0x1F,  0x3A,  0x43,  0x8A,  0x96,  0x41,  0x74,  0xAC,  0x52,  0x33,  0xF0,  0xD9,  0x29,  0x80,  0xB1,  0x16,
     0xD3,  0xAB,  0x91,  0xB9,  0x84,  0x7F,  0x61,  0x1E,  0xCF,  0xC5,  0xD1,  0x56,  0x3D,  0xCA,  0xF4,  0x05,
     0xC6,  0xE5,  0x08,  0x49]);
var aes;


function MapleAESOFB (key, iv, mapleVersion, isSend){
    this.iv = iv;
    this.mapleVersion = (((mapleVersion >> 8) & 0xFF) | ((mapleVersion << 8) & 0xFF00));
    if(isSend){
        this.mapleVersion = (this.mapleVersion + 1) * (-1);
    }
    // The cipher is AES256 because the key has 32 bytes which is 256 bits
    aes = require('crypto').createCipheriv('aes-256-ecb', key, '');

    // TODO don't need for now
//    this.cipher = aes;
};

MapleAESOFB.prototype.toString = function () {
    return ("Cipher: " + this.cipher + " mapleVersion: " + (this.mapleVersion)+ " iv: " + this.getIVarray());
};

MapleAESOFB.prototype.getIVarray = function()  {
    var buffer = new Buffer(this.iv);
    var array = [buffer.length];
    for(var i=0; i<buffer.length; i++) {
       array[i]=buffer[i];
    }

    return array;
};

MapleAESOFB.prototype.checkPacketInt = function(header){
    // initialize an empty buffer
    var packetHeaderBuf = new Buffer(2);
    packetHeaderBuf[0] = ((header >> 24) & 0xFF);
    packetHeaderBuf[1] = ((header >> 16) & 0xFF);
    return this.checkPacketBytes(packetHeaderBuf);
};

MapleAESOFB.prototype.checkPacketBytes = function(header){
    return ((((header[0] ^ this.iv[2]) & 0xFF) == ((this.mapleVersion >> 8) & 0xFF)) && (((header[1] ^ this.iv[3]) & 0xFF) == (this.mapleVersion & 0xFF)));
};

var multiplyBytes = function (bytes, count, mul) {
//    var ret = new Buffer(0);
    var ret = [count * mul];
//    var ret = new Buffer(count * mul);
    for (var x = 0; x < count * mul; x++) {
        ret[x] = bytes[x % count];
    }
    return ret;
};

MapleAESOFB.prototype.crypt = function(packet){

    //initialize the number of bytes remaining
    var remaining = packet.length;
    var llength = 0x5B0;
    var start = 0;
    while (remaining > 0) {
        var myIv = multiplyBytes(this.iv, 4, 4);

        var buff = new Buffer(myIv.length);
        for(var i = 0; i < myIv.length; i++){
              buff[i] = myIv[i];
//            console.log(buff[i]);
        }

        myIv = buff;

        if (remaining < llength) {
            llength = remaining;
        }

        for (var x = start; x < (start + llength); x++) {
            var newIv = myIv.slice();
            if ((x - start) % myIv.length == 0) {
                // update the IV (yay!)
                newIv = aes.update(newIv);

//                console.log("\n\nnewIv");
                for (var j = 0; j < myIv.length; j++) {
                    myIv[j] = newIv[j];
//                    console.log(newIv[j]);
                }
            }
            packet[x] ^= myIv[(x - start) % myIv.length];
        }

        start += llength;
        remaining -= llength;
        llength = 0x5B4;
    }
    this.updateIv();
    return packet;
};

MapleAESOFB.prototype.getPacketHeaderInt = function (length){

    var iiv = (this.iv[3]) & 0xFF;
    iiv |= (this.iv[2] << 8) & 0xFF00;
    iiv ^= this.mapleVersion;
    var mlength = ((length << 8) & 0xFF00) | (length >>> 8);
    var xoredIv = iiv ^ mlength;
    var ret = new Buffer(4);
    ret[0] = ((iiv >>> 8) & 0xFF);
    ret[1] = (iiv & 0xFF);
    ret[2] = ((xoredIv >>> 8) & 0xFF);
    ret[3] = (xoredIv & 0xFF);

    return ret;
};

MapleAESOFB.encode = function(packet, client){
    // todo may need to wrap this in a while loop like my doDecode method

    console.log("encoding packets");

    // something may happen to the client in the mean time
    if (client != null) {
        var unencrypted = new Buffer(packet.length);
        for(var i = 0; i < packet.length; i++){
            unencrypted[i] = packet[i];
        }

        // add some array size for the 4 byte packet header
       var ret = new Buffer(unencrypted.length + 4);

        // todo header is a buffer
        // todo getPacketHeader(int)
        var header = client.send.getPacketHeaderInt(unencrypted.length);

        // encrypt the unencrypted but don't make a new variable
        unencrypted = MapleCustomEncryption.encryptData(unencrypted);

        // todo May need to lock these next 3 lines of code but I don't think I need to use mutex lock or any locking because Node isn't multi-threaded and there is just no need since none of thse values are being edited

        client.send.crypt(unencrypted);
       for(var i = 0; i < 4; i++){
           ret[i] = header[i];
       }

        for(var i = 0; i < unencrypted.length; i++){
            ret[4+i] = unencrypted[i];
        }
        client.encoded = ret;

    } else {
        // send the same message received back to the client
        client.encoded = packet;
    }

    return client;
};


MapleAESOFB.prototype.updateIv = function(){
    this.iv = getNewIv(this.iv);
};

var getNewIv = function(oldIv){
    // 4 byte ("double word") used for shuffling the IV. This key was found inside the MapleStory client.
    console.log("\n\n\ngetNewIv results: ");
    var dwDefaultKey = new Buffer ([0xf2, 0x53, 0x50, 0xc6]);
    for (var x = 0; x < 4; x++) {
        funnyShift(oldIv[x], dwDefaultKey);
         console.log(dwDefaultKey[x]);
    }
    return dwDefaultKey;
};

// apply shuffle algorithm from MapleStory client.
var funnyShift = function(inputByte, shuffleKey){
    var elina = shuffleKey[1];
    var anna = inputByte;
    var moritz = funnyBytes[elina & 0xFF];
    moritz -= inputByte;
    shuffleKey[0] += moritz;
    moritz = shuffleKey[2];
    moritz ^= funnyBytes[anna & 0xFF];
    elina -= moritz & 0xFF;
    shuffleKey[1] = elina;
    elina = shuffleKey[3];
    moritz = elina;
    elina -= shuffleKey[0] & 0xFF;
    moritz = funnyBytes[moritz & 0xFF];
    moritz += inputByte;
    moritz ^= shuffleKey[2];
    shuffleKey[2] = moritz;
    elina += funnyBytes[anna & 0xFF] & 0xFF;
    shuffleKey[3] = elina;
    var merry = (shuffleKey[0]) & 0xFF;
    merry |= (shuffleKey[1] << 8) & 0xFF00;
    merry |= (shuffleKey[2] << 16) & 0xFF0000;
    merry |= (shuffleKey[3] << 24) & 0xFF000000;
    var ret_value = merry;
    ret_value = ret_value >>> 0x1d;
    merry = merry << 3;
    ret_value = ret_value | merry;
    shuffleKey[0] = (ret_value & 0xFF);
    shuffleKey[1] = ((ret_value >> 8) & 0xFF);
    shuffleKey[2] = ((ret_value >> 16) & 0xFF);
    shuffleKey[3] = ((ret_value >> 24) & 0xFF);
    return shuffleKey;
};

MapleAESOFB.getPacketLength = function(header){
    var packetLength = ((header >>> 16) ^ (header & 0xFFFF));
    packetLength = ((packetLength << 8) & 0xFF00) | ((packetLength >>> 8) & 0xFF);
    return packetLength;
};

// required for "importing this class" as in Java
 module.exports = MapleAESOFB;