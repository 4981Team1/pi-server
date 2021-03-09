const util = require('util');

const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

function VoteCharacteristic(user){
    VoteCharacteristic.super_.call(this, {
      uuid: '01010101010101010101010101524745',
      properties: ['write'],
      descriptors: [
        new BlenoDescriptor({
          uuid: '2901',
          value: 'places users vote in election'
        })
      ]
    });
    this._vote = new Buffer(0);
    this.user = user;
}

util.inherits(VoteCharacteristic, BlenoCharacteristic);

VoteCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._vote = data;
    console.log(`VoteCharacteristic - onWriteRequest: value = ${this._vote}`);
    //package payload vote payload to be posted to server (with user obj)

    //return POST status to mobile
    callback(Characteristic.RESULT_SUCCESS);
};
  
module.exports = VoteCharacteristic;