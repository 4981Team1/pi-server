# pi-server
> Voting Machine BLE Peripheral

**pi-server** is a BLE (Bluetooth Low Energy) peripheral for *the Good Team's* voting machine. The peripheral runs on a *the Good Team* registered Raspberry Pi and enables users to securely vote in elections over BLE using the Flutter client on either iOS or Android mobile devices.

## Set Up
### Prerequisites
+ Raspberry Pi with Bluetooth Support
+ The following installed on the Pi:
	+ Raspian (or another Linux OS)
	+ git
	+ Node 8.9.0 (recommend using n or nvm)
+ This repository clones and set as working directory
### bleno
Meet bleno prerequisites according to [docs](https://github.com/noble/bleno).
1. Disable `bluetoothhd` if BlueZ 5.14 or later is installed:

    ```sudo systemctl stop bluetooth``` (once)
    
	  ```sudo systemctl disable bluetooth``` (persist)

2. Install prerequisites for bleno
	
    ```sudo apt-get update```

    ```sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev make gcc```

    ```sudo npm install node-gyp bluetooth-hci-socket --unsafe-perm```

3. Ensure node is on path. (*Using a package manager, n, or nvm to download node will likely require symlink.*)
    1. Check if node is on path:  `which node`
    2. If path is not found, find where node is installed. Try `which nodejs` to find your path.
    3. Symbolically link your node path and node: `sudo ln -s <your node path> /usr/bin/node`

### Node
Install remaining depedencies: `npm install`
## Launching Peripheral
1. Ensure prerequisites are met
2. Check that Raspberry Pi has internet and bluetooth connectivity
3. Navigate to pi-server root directory
4. Launch peripheral by running: `sudo node app.js`
5. If successful the console should display:
	```
	bleno -pi server
	on -> stateChange: poweredOn
	on -> advertisingStart: success
	```

Mobile devices running the Flutter client should now be able to see the peripheral as `Voting-Pi`. After connecting to the pi users are able to sign in, see their avaible elections and place a vote.
