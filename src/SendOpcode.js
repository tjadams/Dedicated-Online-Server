/**
 * Created by Tyler Adams on 29/06/2014.
 */
function RecvOpcode() {
};


var opcodes = {
    // TODO add more opcodes for v83

    LOGIN_PASSWORD: 0x01,
    ACCEPT_TOS: 0x07,
    AFTER_LOGIN: 0x09

};

var getOpcodes = function (){
    // TODO find a cleaner way to do this using my enum above. If not, clean up indeces
    var array = [];

    array[0] = 0x01;
    array[1] = 0x07;
    array[2] = 0x09;

    return array;
};

module.exports = {
   getOpcodes: getOpcodes,
   opcodes: opcodes
};