var mysql = require('mysql');
var MaplePacketCreator = require('./MaplePacketCreator');

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
    this.loginattempt = 0;
    this.accountName = "";
    this.accId = 0;
    this.gmlevel = 0;
    this.pin = 0;
    this.pic = 0;
    this.characterSlots = 0;
    this.gender = "";
    this.loggedIn = false;
    this.state= this.LOGIN_NOTLOGGEDIN;
};


MapleClient.prototype.loginMaple = function(login, pwd){
    console.log("Account: "+this.accountName+" entered login().");

    this.loginattempt++;
    if (this.loginattempt > 4) {
        console.log("Account: "+this.accountName+" too many attempts, closing");
        this.session.destroy();
    }
    var loginok = 5;

    // TODO NOTE: this refers to the connection when I'm inside the mysql conenction, so I need a client reference if I want to call this as a MapleClient object
    var clientReference = this;

    var connection = mysql.createConnection({
        host : 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        // creative database name eh?
        database: 'root'
    });

    var isCon = false;
    connection.connect(function(err) {
        isCon = true;
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log("Account: "+clientReference.accountName+" preparing database statement");

        // TODO this looks like bad practise...
        connection.query("SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login], function(err, rs) {
            if(err){
                console.error(' back to 2007 we go!!');
            }else{
//                if (rs.size > 0) {
                // TODO fix the above check to see if rs exists
                    if (rs[0].banned == 1) {
                        return 3;
                    }
                    clientReference.accId = rs[0].id;
                    clientReference.gmlevel = rs[0].gm;
                    clientReference.pin = rs[0].pin;
                    clientReference.pic = rs[0].pic;
                    clientReference.gender = rs[0].gender;
                    clientReference.characterSlots = rs[0].characterslots;
                    var passhash = rs[0].password;
                    var salt = rs[0].salt;
                    var tos = rs[0].tos;
                    if (getLoginState() > clientReference.LOGIN_NOTLOGGEDIN) {
                        clientReference.loggedIn = false;
                        loginok = 7;
                    }
                    // TODO add a method similar to MoopleDev's checkHash
                    else if (pwd == passhash){
                        if (tos == 0) {
                            loginok = 23;
                        } else {
                            loginok = 0;
                        }
                    }else {
                        clientReference.loggedIn = false;
                        loginok = 4;
                    }

                    connection.query("INSERT INTO iplog (accountid, ip) VALUES (?, ?)",[clientReference.accId, clientReference.session.remoteAddress], function(err, rs) {
                        if (err) {
                            console.error(' back to 2007 we go!!');
                        } else {
                            console.log("inserted results: "+rs[0]);
                        }
                    });
//                }
            }

            connection.end();
            console.log("Finished mySQL connection.");

            // reset the client's loginattempts if login is successful
            if (loginok == 0) {
                clientReference.loginattempt = 0;
            }

            console.log("\n\nloginok = "+loginok+" login = "+login+" pwd = "+pwd);


            // fixed nodejs problem with loginok = clientReference.loginMaple(blahblahlabl), because Node is non-blocking when I connect to mySql within clientReference.loginMaple, it will keep going into this method even before loginMaple is done
            if (loginok != 0) {
                console.log("Account: "+clientReference.getAccountName()+ " login failed, most likely disconnecting");
                clientReference.announce(MaplePacketCreator.getLoginFailed(loginok));

                return;
            }
            // successful login
            if (clientReference.finishLogin() == 0) {
                clientReference.announce(MaplePacketCreator.getAuthSuccess(clientReference));
                console.log("Account: "+clientReference.getAccountName()+ "logged in successfuly");
                // TODO add idle client disconnection for logged in clients
            } else {
                clientReference.announce(MaplePacketCreator.getLoginFailed(7));
                console.log("Account: "+clientReference.getAccountName()+ "login failed");
            }


        });
    });


//    return loginok;
};


var getLoginState = function(){

    var clientReference = this;

// oh noez you know my secrets!
    var connection = mysql.createConnection({
        host : 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        // creative database name eh?
        database: 'root'
    });

    var isCon = false;
    connection.connect(function(err) {
        isCon = true;
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        console.log('mySQL database connected as id ' + connection.threadId);

        // TODO this looks like bad practise...
        connection.query("SELECT loggedin, lastlogin, UNIX_TIMESTAMP(birthday) as birthday FROM accounts WHERE id = ?",[clientReference.accId], function(err, results) {
            if(err){
                console.error(' back to 2007 we go!! '+err);
                clientReference.loggedIn = false;
            }else {
                // TODO add a proper results check
//                if (!results.next()) {
//                    console.error("!Results.next this is not supposed to happen");
//                } else {

                    // TODO add birthday stuff
                    console.log("UPDATE loggedin results: " + results);

//                    this.state = rs.getInt("loggedin");
                    clientReference.state = results[0].state;
                    if (clientReference.state == clientReference.LOGIN_SERVER_TRANSITION) {
                        if (results[0].lastlogin.getTime() + 30000 < new Date().getTime()) {
                            clientReference.state = clientReference.LOGIN_NOTLOGGEDIN;
                            updateLoginState(clientReference.LOGIN_NOTLOGGEDIN);
                        }
                    }


                    if (clientReference.state == clientReference.LOGIN_LOGGEDIN) {
                        clientReference.loggedIn = true;
                    }else if (clientReference.state == clientReference.LOGIN_SERVER_TRANSITION) {

                        connection.query("UPDATE accounts SET loggedin = 0 WHERE id = ?",[clientReference.accId], function(err, results) {
                            if (err) {
                                console.error(' back to 2007 we go!! ' + err);
                                clientReference.loggedIn = false;
                            } else {

                            }
                        });
                    } else {
                        clientReference.loggedIn = false;
                    }
//                }
            }

            connection.end();
            console.log("Finished mySQL connection.");
        });
    });
    return clientReference.state;
};


MapleClient.prototype.setAccountName = function (login) {
    this.accountName = login;
};

MapleClient.prototype.getAccountName = function(){
    return this.accountName;
};

MapleClient.prototype.finishLogin = function(){
    // TODO all this.values stuff should go to values, NOT the MapleClient object

    // NOTE: the client keeps going
    if (getLoginState(this) > this.LOGIN_NOTLOGGEDIN) {

        // return an arbitrary number != 0 to not satisfy the if statement in AcceptToSHandler
        return 7;
    }
    updateLoginState(this.LOGIN_LOGGEDIN);
    return 0;
};

var updateLoginState = function(newstate){

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

MapleClient.prototype.acceptToS = function(){
    // todo add non-blocking io with a callback
    var shouldDisconnect = false;
    var clientReference = this;

    if(this.accountName == null){
        return true;
    }

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
        connection.query("SELECT `tos` FROM accounts WHERE id = ?",[clientReference.accId], function (err, results) {
            if (err) {
                console.error(' back to 2007 we go!!');
            } else {
                if (results != null) {
                    if (results[0].tos == 1) {
                        shouldDisconnect = true;
                    }
                }
                connection.query("UPDATE accounts SET tos = 1 WHERE id = ?", [clientReference.accId], function (err, results) {
                    if (err) {
                        console.error(' back to 2007 we go!!');
                    }
                });
            }
            connection.end();
            console.log("Finished mySQL connection.");
        });
    });
    return shouldDisconnect;
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