/**
 * Created by Tyler Adams on 29/06/2014.
 */
function SendOpcode() {
};


var opcodes = {
    // TODO add more opcodes for v83
    CHECK_PINCODE: 0x06,
    LOGIN_STATUS: 0x00,
    // 0x0A
    SERVERLIST:  10,
    // 0x1A
    LAST_CONNECTED_WORLD:  26,
    // 0x1b
    RECOMMENDED_WORLD_MESSAGE: 27,
    SERVERSTATUS: 0x03,
    // 0x0b
    CHARLIST: 11

};

var getOpcodes = function (){
    // TODO find a cleaner way to do this using my enum above. If not, clean up indeces
    var array = [];

    array[0] = 0x06;

    return array;
};

module.exports = {
   getOpcodes: getOpcodes,
   opcodes: opcodes
};