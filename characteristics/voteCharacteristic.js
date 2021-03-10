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
    this._buffer = new Buffer(0);
    this.user = user;
}

util.inherits(VoteCharacteristic, BlenoCharacteristic);

VoteCharacteristic.prototype.onWriteRequest = async function(data, offset, withoutResponse, callback) {
    this._buffer = data;

    console.log(`VoteCharacteristic - onWriteRequest: value = ${this._buffer}`);
    //package payload vote payload to be posted to server (with user obj)
    try{
      let vote = JSON.parse(this._buffer);
      const res = await axios.post(`https://good-team.herokuapp.com/vote/${this.user.id}/${vote._id}/${vote.selected}`);
      callback(this.RESULT_SUCCESS);
    }catch(error){
      console.log(error)
      callback(this.RESULT_UNLIKELY_ERROR);
    }
};
  
module.exports = VoteCharacteristic;