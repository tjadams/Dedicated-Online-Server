exports.values = {
    // TODO add more opcodes for v83
    LOGIN_NOTLOGGEDIN: 0,
    LOGIN_SERVER_TRANSITION: 1,
    LOGIN_LOGGEDIN: 2
};


var MapleClient = module.exports = function MapleClient(sendCypher, recvCypher, sock) {
    this.send = sendCypher;
    this.receive = recvCypher;
    this.session = sock;
    this.pinattempt = 0;
};


MapleClient.prototype.setAccountName = function (login) {
    this.login = login;
};

MapleClient.prototype.getAccountName = function(){
    return this.login;
};

MapleClient.prototype.finishLogin = function(){
    // TODO all this.values stuff should go to values, NOT the MapleClient object
    if (getLoginState() > this.LOGIN_NOTLOGGEDIN) {

        // return an arbitrary number != 0 to not satisfy the if statement in AcceptToSHandler
        return 7;
    }
    this.updateLoginState(this.LOGIN_LOGGEDIN);
    return 0;
};

MapleClient.prototype.updateLoginState = function(newstate){

    var reference = this;
    var connection = mysql.createConnection({
        host : 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        // creative database name eh?
        database: 'root'
    });

    // credit goes to moopledev creators for the logic in this method
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('mySQL database connected as id ' + connection.threadId);

        // TODO this looks like bad practise...
        connection.query("UPDATE accounts SET loggedin = ?, lastlogin = CURRENT_TIMESTAMP() WHERE id = ?", [newstate, reference.getAccID()], function(err, results) {
            if(err){
                console.error(' back to 2007 we go!!');
            }else{
                console.log("UPDATE loggedin results: "+results);
            }

            connection.end();
            console.log("Finished mySQL connection.");
        });

        if (newstate == this.LOGIN_NOTLOGGEDIN) {
            this.loggedIn = false;
            this.serverTransition = false;
        } else {
            this.serverTransition = (newstate == this.LOGIN_SERVER_TRANSITION);
            this.loggedIn = !this.serverTransition;
        }
    });

};

MapleClient.prototype.setAccId = function(accountID){
  this.accId = accountID;
};

MapleClient.prototype.getAccID = function(){
    return this.accId;
};

MapleClient.prototype.toString = function () {
    return ("" + this.session + " " + this.send + " " + this.receive);
};

MapleClient.prototype.setWorld = function (world) {
    this.world = world;
};

MapleClient.prototype.setChannel = function (channel) {
    this.channel = channel;
};

MapleClient.prototype.announce = function (packet){
    this.session.write(packet);
};

MapleClient.prototype.getPin = function(){
    return this.pin;
};

MapleClient.prototype.setPin = function(pin){
    this.pin = pin;
};

MapleClient.prototype.checkPin = function(pin){
   pinattempt = pinattempt + 1;
   if(pinattempt > 5){
       // destroy the socket connection
       this.session.destroy();
   }

    if(this.pin == pin){
        pinattempt = 0;
        return true;
    }
    return false;
};

MapleClient.prototype.updateLoginState = function(state){

};

MapleClient.prototype.setDecoderState = function(decoderState){
    this.decoderState = decoderState;
};

MapleClient.prototype.setDecoderPacketLength = function(decoderPacketLength){
    this.decoderPacketLength = decoderPacketLength;
};

MapleClient.prototype.getDecoderPacketLength = function(){
    return this.decoderPacketLength;
};

MapleClient.prototype.getReceiveCrypto = function(){
    return this.receive;
};


MapleClient.prototype.getDecoderState = function(){
    return this.decoderState;
};

module.exports = MapleClient;