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


MapleClient.prototype.login = function(login, pwd){
    console.log("Account: "+this.accountName+" entered login().");

    this.loginattempt++;
    if (this.loginattempt > 4) {

        console.log("Account: "+this.accountName+" too many attempts, closing");

        this.session.destroy();
    }
    var loginok = 5;



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
        console.log("Account: "+this.accountName+" preparing database statement");

        // TODO this looks like bad practise...
        connection.query("SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login], function(err, rs) {
            if(err){
                console.error(' back to 2007 we go!!');
            }else{
                console.log("UPDATE login. Results: "+rs);

                // pretty much says if the returned table has values because we only care about one row here.
                // What rs.next does is positions the cursor before the current row then checks if the current row has stuff in it (true/false)
                if (rs.next()) {
                    if (rs.getByte("banned") == 1) {
                        return 3;
                    }
                    this.accId = rs.getInt("id");
                    this.gmlevel = rs.getInt("gm");
//                    pin = rs.getString("pin");
                    this.pin = rs[6];
//                    pic = rs.getString("pic");
                    this.pic = rs[7];
                    this.gender = rs.getByte("gender");
                    this.characterSlots = rs.getByte("characterslots");
//                    var passhash = rs.getString("password");
                    var passhash = rs[1];
//                    var salt = rs.getString("salt");
                    var salt = rs[2];
                    var tos = rs.getByte("tos");
                    if (getLoginState() > this.LOGIN_NOTLOGGEDIN) {
                        this.loggedIn = false;
                        loginok = 7;
                    } else if (pwd.equals(passhash) || checkHash(passhash, "SHA-1", pwd) || checkHash(passhash, "SHA-512", pwd + salt)) {
                        if (tos == 0) {
                            loginok = 23;
                        } else {
                            loginok = 0;
                        }
                    }else {
                        this.loggedIn = false;
                        loginok = 4;
                    }

                    connection.query("INSERT INTO iplog (accountid, ip) VALUES (?, ?)",[this.accId, this.session.remoteAddress], function(err, rs) {
                        if (err) {
                            console.error(' back to 2007 we go!!');
                        } else {
                            console.log("inserted results: "+rs);
                        }
                    });
                }
            }

            connection.end();
            console.log("Finished mySQL connection.");
        });
    });

    // reset the client's loginattempts if login is successful
    if (loginok == 0) {
       this.loginattempt = 0;
    }

    return loginok;
};

var getLoginState = function(){



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
        connection.query("SELECT loggedin, lastlogin, UNIX_TIMESTAMP(birthday) as birthday FROM accounts WHERE id = ?",[this.accId], function(err, results) {
            if(err){
                console.error(' back to 2007 we go!! '+err);
                this.loggedIn = false;
            }else {
                if (!results.next()) {
                    console.error("!Results.next this is not supposed to happen");
                } else {

                    // TODO add birthday stuff
                    console.log("UPDATE loggedin results: " + results);

//                    this.state = rs.getInt("loggedin");
                    this.state = results[0];
                    if (this.state == this.LOGIN_SERVER_TRANSITION) {
                        if (results[1].getTime() + 30000 < new Date().getTime()) {
                            this.state = this.LOGIN_NOTLOGGEDIN;
                            updateLoginState(this.LOGIN_NOTLOGGEDIN);
                        }
                    }


                    if (this.state == this.LOGIN_LOGGEDIN) {
                        this.loggedIn = true;
                    }else if (this.state == this.LOGIN_SERVER_TRANSITION) {

                        connection.query("UPDATE accounts SET loggedin = 0 WHERE id = ?",[this.accId], function(err, results) {
                            if (err) {
                                console.error(' back to 2007 we go!! ' + err);
                                this.loggedIn = false;
                            } else {

                            }
                        });
                    } else {
                        this.loggedIn = false;
                    }
                }
            }

            connection.end();
            console.log("Finished mySQL connection.");
        });
    });
    return this.state;
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