/**
 * Created by Tyler Adams on 20/07/2014.
 */
var mysql = require('mysql');
var q = require('q');

var login = "tyler";
var connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: 'root',
    port: '3306',
    database: 'root'
});

var gotLoginState;
var state;


// not clean but meh
///*
connection.connect(function(err) {
    if(err != null){
        console.log("connection err: "+err);
    }

    q.nfcall(connection.query.bind(connection),"SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login])
        .then(function (results) {
          console.log("select: "+results[0][0]);
            return getLoginState()
                .then(function(state) {
                    console.log("gotLoginState: " + state);
                }).catch(function (error){
                   console.log("error in inner thing");
            });// no need to .done(); here since we want to chain it
        }).then(function () {
            console.log("this should happen last");
        }).catch(function (error) {
            console.error("promise error: "+error);
        }).done();
});
//  */


var accId = 1;

var getLoginState = function() {
    return q.nfcall(connection.query.bind(connection), "SELECT loggedin, lastlogin, UNIX_TIMESTAMP(birthday) as birthday FROM accounts WHERE id = ?", [accId])
        .then(function (results) {
            //NOTE: these comments work but then passing by reference doesn't really work so I'd need to use global variables
            return 99;
        }).catch(function (error) {
            console.log("error in chaining: "+error);
        }); // no need to .done(); here since we want to chain it
};

// making it cleaner but not working
/*
connection.connect(function(err) {
    if(err != null){
        console.log("connection err: "+err);
    }

    q.nfcall(connection.query.bind(connection),"SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login])
        .then(function (results) {
            console.log("select: "+results[0][0]);
            // todo this can probably be optimized like this
        }).then(return getLoginState())
        .then(function (state) {
                console.log("gotLoginState: " + state);
        }).catch(function (error) {
            console.error("promise error: "+error);
        }).done();
});
  */
