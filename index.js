var crypto 	= require('crypto'),
	low 	= require('lowdb'),
	uuid = require('node-uuid'),
	moment = require('moment');
	

var Usury = module.exports = {};

Usury.init = function(dbPath){
	this.db = low(dbPath);
	this.userId = 1;
};

Usury._simulateCallback = function(err,ret,cb){
	setTimeout(function(){
		cb(err,ret);
	},1);
};
//----------------------------------------------------
Usury._hash = function(str){
	var shasum 	= crypto.createHash('sha256');
	shasum.update(str);
	return shasum.digest('hex');
};
//----------------------------------------------------
Usury.addUser = function(name,password,cb){

	if(this.getUser("name",name)) {
		return this._simulateCallback("user name already exists",null,cb);
	}

	this.db('users').push({ name: name,passwordHash:this._hash(password),id:this.userId++});
	this._simulateCallback(null,this.getUser("name",name),cb);
};
//----------------------------------------------------
Usury.getUser = function(field,value){

	var query = {};
	query[field] = value;

	
	if(field === "sessionId"){
		return this.db('users').find({"id":this.db('sessions').find({"id":sessionId})});
	}

	return this.db('users').find(query)
};
//----------------------------------------------------
Usury.auth = function(name,password,cb){
	
	var user = this.getUser("name",name);
	
	if(!user) return this._simulateCallback("auth failed",null,cb);

	if(this._hash(password)!==user.passwordHash)  return this._simulateCallback("auth failed",null,cb);

	return this._simulateCallback(null,user,cb);
};
//----------------------------------------------------
Usury.createSession = function(name,password,ttl,cb){
	
	var self = this;

	this.auth(name,password,function(err,user){
		if(err) return cb(err);

	 	var expiration 	= moment().add(ttl,"seconds").format(),
	 		sessionId 	= uuid.v4();

		self.db('sessions').push({
			id:sessionId,
			userId:user.id,
			expiration:expiration
		});

		self._simulateCallback(null,sessionId,cb);

	});
};
//----------------------------------------------------
Usury.authSession = function(sessionId,cb){
	
	var session = this.db('sessions').find({id:sessionId});

	if(!session) return this._simulateCallback("session not found",null,cb);

	return this._simulateCallback(null,session,cb);
};
//----------------------------------------------------
