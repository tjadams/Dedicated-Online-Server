/**
 * Created by Tyler Adams on 05/07/2014.
 */
function MapleCustomEncryption () {

};

MapleCustomEncryption.decryptData = function (data){
    for (var j = 1; j <= 6; j++) {
        var remember = 0;
        var dataLength = (data.length & 0xFF);
        var nextRemember;
        if (j % 2 == 0) {
            for (var i = 0; i < data.length; i++) {
                var cur = data[i];
                cur -= 0x48;
                cur = ((~cur) & 0xFF);
                cur = rollLeft(cur, dataLength & 0xFF);
                nextRemember = cur;
                cur ^= remember;
                remember = nextRemember;
                cur -= dataLength;
                cur = rollRight(cur, 3);
                data[i] = cur;
                dataLength--;
            }
        } else {
            for (var i = data.length - 1; i >= 0; i--) {
                var cur = data[i];
                cur = rollLeft(cur, 3);
                cur ^= 0x13;
                nextRemember = cur;
                cur ^= remember;
                remember = nextRemember;
                cur -= dataLength;
                cur = rollRight(cur, 4);
                data[i] = cur;
                dataLength--;
            }
        }
    }
    return data;
};

var rollLeft = function(cur,count){
    var tmp = cur & 0xFF;
    tmp = tmp << (count % 8);
    return ((tmp & 0xFF) | (tmp >> 8));
};

var rollRight = function(cur,count){
    var tmp = cur & 0xFF;
    tmp = (tmp << 8) >>> (count % 8);
    return ((tmp & 0xFF) | (tmp >>> 8));
};

module.exports = MapleCustomEncryption;