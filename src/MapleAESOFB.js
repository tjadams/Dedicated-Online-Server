var crypto = require('crypto');

function MapleAESOFB (key, iv, mapleVersion, isSend){
    this.iv = iv;
    this.mapleVersion = (((mapleVersion >> 8) & 0xFF) | ((mapleVersion << 8) & 0xFF00));
    if(isSend){
        this.mapleVersion = (this.mapleVersion + 1) * (-1);
    }
    // The cipher is AES256 because the key has 32 bytes which is 256 bits
    this.cipher = crypto.createCipher('aes256',key);
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

// required for "importing this class" as in Java
 module.exports = MapleAESOFB;