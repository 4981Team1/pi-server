const util = require('util');

const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

function TokenCharacteristic(user){
    TokenCharacteristic.super_.call(this, {
      uuid: '01010101010101010101010101524742',
      properties: ['write', 'notify'],
      descriptors: [
        new BlenoDescriptor({
          uuid: '2901',
          value: 'authenticate user for election'
        })
      ]
    });
    this._updateValueCallback = null;
    this._token = new Buffer(0);
    this._MTU = 20;
    this.user = user;
}

util.inherits(TokenCharacteristic, BlenoCharacteristic);

TokenCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._token = data;
    console.log(`TokenCharacteristic - onWriteRequest: value = ${this._token}`);

    if(this._updateValueCallback){
        let MTU = this._MTU;
        //authenticate user and get their elections here
        console.log(this.user);
        this.user._MTU = this._MTU;
        console.log(this.user);
        //sends chunked elections payload to mobile client
        let datastream = "hello world";
        console.log(`TokenCharacteristic - onWriteRequest: notifying`);
        for(let i = 0; i<datastream.length/MTU;i++){
          let buff = new Buffer(datastream.substr(i*MTU, MTU));
          console.log('Notifying: '+buff.toString());
          this._updateValueCallback(buff);
        }
        this._updateValueCallback(new Buffer([0x00]));
            callback(this.RESULT_SUCCESS);
    }else{
        console.log(`TokenCharacteristic - onWriteRequest: notifying, no device to notify.`)
        callback(this.RESULT_UNLIKELY_ERROR);
    }
};

TokenCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback){
	console.log('TokenCharacteristic - onSubscribe');
	this._updateValueCallback = updateValueCallback;
  this._MTU = maxValueSize;
  console.log(`TokenCharacteristic - onSubscribe: MTU = ${this._MTU}`);
};

TokenCharacteristic.prototype.onUnsubscribe = function(){
	console.log('TokenCharacteristic - onUnsubscribe');
	this._updateValueCallback = null;
};
  
module.exports = TokenCharacteristic;