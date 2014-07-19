var mysql = require('mysql');
var q = require('q');
var MaplePacketCreator = require('./MaplePacketCreator');

exports.values = {
    // TODO add more opcodes for v83
    LOGIN_NOTLOGGEDIN: 0,
    LOGIN_SERVER_TRANSITION: 1,
    LOGIN_LOGGEDIN: 2
};


var MapleClient = module.exports = function MapleClient(sendCypher, recvCypher, sock, connection) {
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
    this.connection = connection;
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

    console.log("Account: "+clientReference.accountName+" preparing database statement");

    var rs, gotLoginState, passhash, salt, tos, finishedLogin;
//    var promise = q.denodeify(clientReference.connection.query("SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login]));
   var promise = q.nfcall(clientReference.constructor.query,  '"SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login]');
    promise.then(function (results) {
            rs = results;
        }).then(getLoginState(), function(results){
            gotLoginState = results;
            // TODO verify that the catch block will verify the existance of rs
            if (rs[0].banned == 1) {
                // TODO verify that a return statement will return as if it was returned in the main part of loginMaple
                return 3;
            }

            clientReference.accId = rs[0].id;
            clientReference.gmlevel = rs[0].gm;
            clientReference.pin = rs[0].pin;
            clientReference.pic = rs[0].pic;
            clientReference.gender = rs[0].gender;
            clientReference.characterSlots = rs[0].characterslots;
            passhash = rs[0].password;
            salt = rs[0].salt;
            tos = rs[0].tos;
            if (gotLoginState > clientReference.LOGIN_NOTLOGGEDIN) {
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
        }).then(querydb("INSERT INTO iplog (accountid, ip) VALUES (?, ?)",[clientReference.accId, clientReference.session.remoteAddress]), function (results) {
            console.log("inserted results: "+rs[0]);
        }).then(clientReference.finishLogin(), function(results){
            finishedLogin = results;
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
            if (finishedLogin == 0) {
                clientReference.announce(MaplePacketCreator.getAuthSuccess(clientReference));
                console.log("Account: "+clientReference.getAccountName()+ "logged in successfuly");
                // TODO add idle client disconnection for logged in clients
            } else {
                clientReference.announce(MaplePacketCreator.getLoginFailed(7));
                console.log("Account: "+clientReference.getAccountName()+ "login failed");
            }
        }).catch(function (error) {
            console.log("error in loginMaple chaining: "+error);
        }).done();
};


// NOTE: here is an example of having chaining with promises inside conditionals
var getLoginState = function(){

    var clientReference = this;
    var querydb = q.denodeify(clientReference.connection.query);
    var nextPromise, nextFunction, nextFunctionContent;
   return querydb("SELECT loggedin, lastlogin, UNIX_TIMESTAMP(birthday) as birthday FROM accounts WHERE id = ?",[clientReference.accId])
        .then(function (results) {

            // TODO verify that the catch block will verify the existance of rs
            // TODO add birthday stuff
            console.log("UPDATE loggedin results: " + results);

            clientReference.state = results[0].state;
            if (clientReference.state == clientReference.LOGIN_SERVER_TRANSITION) {
                if (results[0].lastlogin.getTime() + 30000 < new Date().getTime()) {
                    clientReference.state = clientReference.LOGIN_NOTLOGGEDIN;
                    // TODO I think what I'm doing here is fixing this possible race condition
                    nextFunction = clientReference.updateLoginState;
//                    nextFunctionContent = clientReference.LOGIN_NOTLOGGEDIN;
                }
            }

            if (clientReference.state == clientReference.LOGIN_LOGGEDIN) {
                clientReference.loggedIn = true;
            }else if (clientReference.state == clientReference.LOGIN_SERVER_TRANSITION) {

                nextFunction = querydb;
//                nextFunctionContent ='"UPDATE accounts SET loggedin = 0 WHERE id = ?",[clientReference.accId]';
            } else {
                clientReference.loggedIn = false;
            }

           // NOTE: only the else statement needs denodeify, this first one is just a normal method so I can pass it nextfunction
            if(nextFunction == clientReference.updateLoginState) {
                nextPromise = q.fcall(nextFunction);
                nextPromise(clientReference.LOGIN_NOTLOGGEDIN)
                .catch(function (error) {
                    console.log("error in nextFunction chaining: "+error);
                }).done();
            }
            // only other option is querydb
            else{

                nextPromise = q.denodeify(nextFunction);
                nextPromise("UPDATE accounts SET loggedin = 0 WHERE id = ?",[clientReference.accId])
                .catch(function (error) {
                    console.log("error in nextFunction chaining: "+error);
                }).done();
            }

            // todo the method is done so I should return the current state as if I were returning from the main part of this method
            // todo to further ensure that this returns as if it were in the main part of this method, I can check to see if this return makes the promise have the value of clientReference.state and then if it does, I can just return the promise
            return clientReference.state;

        }).catch(function (error){
            console.error(' back to 2007 we go!! '+error);
            clientReference.loggedIn = false;
        }).done();

//    todo MAYBE this will return clientReference.state AFTER the promises have completed
//    return clientReference.state;

};


MapleClient.prototype.setAccountName = function (login) {
    this.accountName = login;
};

MapleClient.prototype.getAccountName = function(){
    return this.accountName;
};

MapleClient.prototype.finishLogin = function(){
    // TODO all this.values stuff should go to values, NOT the MapleClient object

    var clientReference = this;
    // NOTE: the client keeps going so I need to use promises here
    var loginPromise = q.fcall(getLoginState);
    var loginResults, hasReturned = false;
    return loginPromise()
        .then(function (results) {
            loginResults = results;

            if (loginResults > clientReference.LOGIN_NOTLOGGEDIN) {
                // return an arbitrary number != 0 to not satisfy the if statement in AcceptToSHandler
                hasReturned = true;
                return 7;
            }
        }).then(function (){
            if(hasReturned){
                // do nothing because the function is returning the promise which is really the value 7
            }else{
                var updatePromise = q.fcall(clientReference.updateLoginState);
                return updatePromise(clientReference.LOGIN_LOGGEDIN).then(function (){
                    return 0;
                }).catch(function (error){
                    console.error('updatePromise error: '+error);
                }).done();
            }
        }).catch(function (error){
            console.error(' finishLogin chaining error: '+error);
        }).done();
};

MapleClient.prototype.updateLoginState = function(newstate){

    var clientReference = this;
    // I'm using promises here to avoid a race condition with getting and updating login states
    var updatePromise = q.denodeify(clientReference.connection.query);
    updatePromise("UPDATE accounts SET loggedin = ?, lastlogin = CURRENT_TIMESTAMP() WHERE id = ?", [newstate, clientReference.getAccID()])
    .then(function (results){
            console.log("UPDATE loggedin results: "+results);
    }).then(function(){
        if (newstate == clientReference.LOGIN_NOTLOGGEDIN) {
            clientReference.loggedIn = false;
            clientReference.serverTransition = false;
        } else {
            clientReference.serverTransition = (newstate == clientReference.LOGIN_SERVER_TRANSITION);
            clientReference.loggedIn = !clientReference.serverTransition;
        }
    }).catch(function (error){
        console.error('updateLoginState error: '+error);
    }).done();
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

    var acceptToSPromise = q.denodeify(clientReference.connection.query);
    return acceptToSPromise("SELECT `tos` FROM accounts WHERE id = ?",[clientReference.accId])
        .then(function (results){
            console.log("acceptToS results: "+results);
            if (results != null) {
                if (results[0].tos == 1) {
                    shouldDisconnect = true;
                }
            }

         }).then(acceptToSPromise("UPDATE accounts SET tos = 1 WHERE id = ?", [clientReference.accId]), function (results){
            console.log("acceptToS update results: "+results);
            return shouldDisconnect;

        }).catch(function (error){
            console.error('acceptToS promise error: '+error);
        }).done();
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