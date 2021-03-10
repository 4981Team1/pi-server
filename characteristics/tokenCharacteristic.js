const util = require('util');
const axios = require('axios');
const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

const { resolve } = require('path');
const apiUrl = 'https://good-team.herokuapp.com';

const getElectionId = async (user) => {
	try {
		console.log('requesting from\n'  + apiUrl + '/eligible/' + user.id);
		return await axios.get(apiUrl+'/eligible/'+user.id);
	} catch (error) {
		console.error(error);
	}
}

const getElectionData = async (electionId) => {
	try {
		return await axios.get(apiUrl+'/elections/'+electionId);
	} catch(error) {
		console.error(error);
	}
};


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

TokenCharacteristic.prototype.onWriteRequest = async function(data, offset, withoutResponse, callback) {
    this._token = data;
    this.user.id = data;
    console.log(`TokenCharacteristic - onWriteRequest: value = ${this._token}`);

    if(this._updateValueCallback){
      let MTU = this._MTU;
      //authenticate user and get their elections here

      let dataPromise = new Promise(async (resolve, reject) => {
        let eligibleElectionIds = await getElectionId(this.user);
        eligibleElectionIds = eligibleElectionIds.data.voteless;
        let electionData = [];
        let queryPromise = new Promise(async (resolve, reject) => {
          for(const eligibleId of eligibleElectionIds) {
            const result = await getElectionData(eligibleId);
            electionData.push(result.data);
          }
        resolve();
        });
        queryPromise.then(() => {
          resolve(electionData);
        });
      });
      dataPromise.then((datastream) => {
        console.log(`TokenCharacteristic - onWriteRequest: notifying`);
        datastream = JSON.stringify(datastream);
        //sends chunked elections payload to mobile client
        for(let i = 0; i<datastream.length/MTU;i++){
          let buff = new Buffer(datastream.substr(i*MTU, MTU));
          console.log('Notifying: '+buff.toString());
          this._updateValueCallback(buff);
        }
        this._updateValueCallback(new Buffer([0x00]));
        callback(this.RESULT_SUCCESS);  
      });
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