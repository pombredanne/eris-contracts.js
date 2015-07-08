# Dapp - the dapp library.

**NOTE: This library is used to call contracts from javascript. This is a work in progress and is not intended for public use. ETA july 2015**

## Creating and running contracts.

First of all you need a running eris-db server. Either use cli to create a chain and serve it (if that's possible yet), or do it the hard way (some instructions on how to set up a simple chain [here](https://github.com/eris-ltd/eris-db.js/tree/master/templates/example_database)).

After that you need to clone this library. Make sure to `npm update` to pull in the dependencies. Normally you'd npm both this and eris-db.js, but there's no npm package for contracts yet so might as well develop inside the lib (put the code inside this repo). This is how you would prepare everything:

```
// Dependencies assuming we're in eris-contracts.js root. Otherwise modify.
var edbModule = require("eris-db");
var DevPipe = require('./lib/pipes/dev_pipe');
// Yes, it is a factory factory right now. Ethereums fault.
var cff = require('./index');

// The private key to use.
var testPrivKey = "123412341234..."

// Create a new edb at whatever url is appropriate (localhost:1337 is the default).
var edb = edbModule.createInstance("http://localhost:1337/rpc');
// Create the dev_pipe, which is the pipe that uses edb's transact method (the one which takes a private key for signing).
var pipe = new DevPipe(edb, testPrivKey);
// Create the contracts object.
var contracts = cff.createInstance(pipe);
```

Now it is ready to be used. The `contracts` object works exactly like the web3 one, except it isn't tied to the web3 object.

```
var myAbi = [...];
var myCompiledCode = "";

// Create factory from abi.
var contractFactory = contracts(myAbi);

// To create a new contract (actually deploy and wait for the contract to be committed to a block etc.) use  `new`:
var myContract;
contractFactory.new({data: code}, function(error, contract){
    if (error) {
        // Just do something.
        throw error;
    }
    myContract = contract;
});
```

You can stick up to two constructor arguments before the `{data: code}` param, though I haven't tested that with this system yet. This is btw. why you have to use an object (TxPayload - it's documented) instead of just a string. Will probably force the constructor params to be in an array later so that the payload can just be a code string as well as an object. Would be easier to verify then now with the variadic stuff.

Note the regular error-first "node-back" callback for new contracts. This is used in all other contract methods as well since they're all IO, and because it's better. The example in `./test/live/create_and_event.js` shows how to do calls to the contracts add method. May/should add promises as an alternative later.

```
myContract.add(34, 22, function(error, sum){
    console.log(sum);
}
```

The format is: params followed by the error-first callback. Always the same.


WARNING: I have not tested these instructions, only copied from the create_and_call example. They may or may not work. I will also not be around to answer any questions for a while. If it's hard, then the only solution is to wait until the library is finished. It will probably take about a week + the work solidity events and server side stuff takes + eris-cli integration, starting when i get back on july 6th.

## Objects and formats



## Unit tests

`mocha` or `npm test`

## Web3 licence

This library is built on [web3.js](https://github.com/ethereum/web3.js). Here is the licence used at the time of pulling in the code (2015-06-21):

```
web3.js is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

web3.js is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
```