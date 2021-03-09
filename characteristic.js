var utils = require('util');
var bleno = require('bleno');
var axios = require('axios');
var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function(){
	EchoCharacteristic.super_.call(this, {
		uuid: 'ec0e',
		properties: ['read', 'write', 'notify'],
		value: null
	});

	this._value = new Buffer(0);
	this._updateValueCallback = null;
};

utils.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback){
	console.log('EchoCharacteristicc - onReadRequiest: value = ' + this._value.toString('hex'));
	callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
	this._value = data;

	console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
	//send to flask server
	let data_send  = {
		data: this._value.toString('hex')
	};
	axios.post('http://127.0.0.1:5000/', data_send)
		.then((res)=>{
			console.log('Status: '+ res.status);
		}).catch((err)=>{
			console.error(err);
		});
	
	//update subscribers
	if(this._updateValueCallback){
		console.log('EchoCharacteristic - onWriteRequest: notifying');
		this._updateValueCallback(this._value);
	}
	callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback){
	console.log('EchoCharacteristic - onSubscribe');
	this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function(){
	console.log('EchoCharacteristic - onUnsubscribe');
	this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;
