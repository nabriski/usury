var moment = require('moment'),
    Usury = require('../index.js'),
    usury;

	
module.exports = {
    setUp: function (callback) {
       	usury = Object.create(Usury);
        usury.init();
        usury.addUser("bob","123456",callback);
    },
    tearDown: function (callback) {
       callback();
    },
    testAddUser: function (test) {
        usury.addUser("chuck","123456",function(err,user){
            test.ok(!err);
            test.equal(user.id,2);
            test.equal(user.name,"chuck");
            test.done();
        });
    },
    testAddUserDuplicateName: function (test) {
        usury.addUser("bob","123456",function(err,user){
            
            test.equal(err,"user name already exists");
            test.done();
        });
    },
    testAuth : function(test){

        usury.auth("bob","123456",function(err,sessionId){
            test.ok(!err);
            test.equal(typeof("sessionId"),"string");
            test.done();
        });
       
    },
    testBadAuthPassword : function(test){

        usury.auth("bob","654321",function(err,sessionId){
            test.equal(err,"auth failed"); 
            test.done();
        });
        
    },
    testBadAutName : function(test){

        usury.auth("bobby","123456",function(err,sessionId){
            test.equal(err,"auth failed"); 
            test.done();
        });
        
    },
    testCreateSession : function(test){
        usury.createSession("bob","123456",3600,function(err,sessionId){

            var now = moment();
            var session = usury.db('sessions').find({id:sessionId});
           
            test.ok(session);
            test.equal(session.userId,1);
            //test expiratiom in 1 hour
            test.equal(moment(session.expiration).hour() % 24,(now.hour()+1) % 24) ;
            test.done();

        });
    },
    testAuthSession : function(test){
        usury.createSession("bob","123456",3600,function(err,sessionId){
           usury.authSession(sessionId,function(err,session){
                test.ok(!err); 
                test.equal(session.userId,1);
                test.done();
           });
        });
    }
   
};

