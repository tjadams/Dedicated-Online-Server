var crypto = require('crypto');

function MapleAESOFB (key, iv, mapleVersion){
    this.iv = iv;
    // TODO investigate (short) cast
    this.mapleVersion = (((mapleVersion >> 8) & 0xFF) | ((mapleVersion << 8) & 0xFF00));
    // TODO investigate what type of AES algorithm i need
    // it's aes 256 because the key has 32 bytes and as a result, 256 bits
    this.cipher = crypto.createCipher('aes256',key);


    // TODO investigate this method call
    //  this.cipher = crypto.createCipheriv('aes256',key, iv);
};

MapleAESOFB.prototype.toString = function () {
    return ("Cipher: " + this.cipher + " mapleVersion: " + this.mapleVersion+ " iv: " + this.iv);
};

// required for "importing this class" as in Java
 module.exports = MapleAESOFB;