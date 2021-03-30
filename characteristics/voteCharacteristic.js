const util = require('util');
const axios = require('axios');
const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;
const apiUrl = 'https://good-team.herokuapp.com';

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
      let jsonObj = {
        "voter_id": this.user.id,
        "election_id": vote._id, 
        "choice" : vote.choice
      }; 
      console.log(jsonObj);
      const adminPromise = new Promise(async (resolve, reject) => {
        let tokenResponse = await axios.post(apiUrl + '/login', {email: "light", password:"light"})
        console.log(tokenResponse);
        if(!tokenResponse) {
          reject();
        }
        resolve(tokenResponse);
      });
      adminPromise.then(async (tokenResponse) => {
        const res = await axios.post(apiUrl + '/ballots', JSON.stringify(jsonObj), {headers: {
          "voter-token": tokenResponse.data.token
        }});
        console.log(`VoteCharacteristic - onWriteRequest: POST res = ${res.status}`)
        callback(this.RESULT_SUCCESS);  
      });
    }catch(error){
      console.log(error)
      callback(this.RESULT_UNLIKELY_ERROR);
    }
};
  
module.exports = VoteCharacteristic;