const util = require('util');

const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

function MTUCharacteristic(user){
    MTUCharacteristic.super_.call(this, {
      uuid: '01010101010101010101010101524742',
      properties: ['write'],
      descriptors: [
        new BlenoDescriptor({
          uuid: '2901',
          value: 'negotiate device\'s MTU (Maximum Transmission Unit) for chunking'
        })
      ]
    });
    this._MTU = new Buffer(0);
    this.user = user;
}

util.inherits(MTUCharacteristic, BlenoCharacteristic);

TokenCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._MTU = data;
    console.log(`MTUCharacteristic - onWriteRequest: value = ${this._token}`);
    //validate MTU is ok

    //set device's MTU
    this.user.MTU = this._MTU;
    callback(Characteristic.RESULT_SUCCESS);

};
  
module.exports = MTUCharacteristic;