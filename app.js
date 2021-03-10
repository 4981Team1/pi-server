require('dotenv').config();

const bleno = require('bleno');
const BlenoPrimaryService = bleno.PrimaryService;
const TokenCharacteristic = require('./characteristics/tokenCharacteristic');
const VoteCharacteristic = require('./characteristics/voteCharacteristic');

const User = require('./models/user');
let user = new User.User();

console.log('bleno -pi server');
bleno.on('stateChange', function(state){
	console.log('on -> stateChange: ' + state);

	if(state === 'poweredOn'){
		bleno.startAdvertising('Voting-Pi', ['vp00']);
	}else{
		bleno.stopAdvertising();
	}
});
bleno.on('advertisingStart', function(error){
	console.log('on -> advertisingStart: ' + (error? 'error' + error : 'success'));
	if(!error){
		bleno.setServices([
			new BlenoPrimaryService({
				uuid: 'vp00',
				characteristics: [
					new TokenCharacteristic(user),
					new VoteCharacteristic(user)
				]
			})
		]);
	}
});
