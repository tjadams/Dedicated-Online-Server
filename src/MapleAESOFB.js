var crypto = require('crypto');

function MapleAESOFB (key, iv, mapleVersion, isSend){
    this.iv = iv;
    // TODO investigate (short) cast
   this.mapleVersion = (((mapleVersion >> 8) & 0xFF) | ((mapleVersion << 8) & 0xFF00));

    if(isSend){
        this.mapleVersion = (this.mapleVersion + 1) * (-1);
    }

//    this.mapleVersion = mapleVersion;
    // TODO investigate what type of AES algorithm i need
    // it's aes 256 because the key has 32 bytes and as a result, 256 bits
    this.cipher = crypto.createCipher('aes256',key);


    // TODO investigate this method call
    //  this.cipher = crypto.createCipheriv('aes256',key, iv);
};

MapleAESOFB.prototype.toString = function () {
    return ("Cipher: " + this.cipher + " mapleVersion: " + (this.mapleVersion)+ " iv: " + this.getIVarray());
};

MapleAESOFB.prototype.getIVarray = function()  {
         //"ucs2": A two-byte, little-endian encoding
    var buffer = new Buffer(this.iv, "ucs2")
    var array = [buffer.length];
    for(var i=0; i<buffer.length; i++) {
                array[i]=buffer[i];
    }

    return array;
}


// required for "importing this class" as in Java
 module.exports = MapleAESOFB;