# eris-contracts - the javascript contracts library.

This library lets you create and interact with on-chain Solidity contracts from javascript. It is a port of Ethereums `web3.js` contracts section. What it does is it provides javascript versions of solidity contracts that can be used to call on-chain contracts from javascript.  

## Installation

`npm install eris-contracts`

### eris-db server

You need a running [eris-db](https://github.com/eris-ltd/eris-db) server. `eris-db` is a server wrapper for [Tendermint](https://github.com/tendermint/tendermint), which is the actual blockchain-client.

#### Native

`eris-db` server is officially supported on Ubuntu `14.04`, `14.10` and `15.04`. Installation instructions can be found in its `README.md` file.

#### Docker

Docker is supported, but it is not recommended to build and run manually (see 'Eris cli' below).

#### Eris cli

The preferred method of configuring your blockchain and starting up the server will be [eris-cli](https://github.com/eris-ltd/eris-cli). It is currently in the last stages before public release. It runs eris-db/tendermint servers through docker.

## Usage

To quickly set up a development/test-environment:

``` javascript
var erisC = require('eris-contracts');

// URL to the rpc endpoint of the eris-db server.
var erisdbURL = "http://localhost:1337/rpc";
// See the 'Private Keys and Signing' section below for more info on this.
var accountData = {address: "...", privKey: "..."};
// contractsDev lets you use an accountData object (address & private key) directly, i.e. no key/signing daemon is needed.
var contracts = erisC.contractsDev(erisdbURL, PrivKey);
``` 

If using a websocket connection, you must add a callback to `contractsDev`.

``` javascript
// ...
var contracts;
erisC.contractsDev(erisdbURL, PrivKey, function(error, _contracts){
    if(!error){
        // Server is ready.
        // ...
        contracts = _contracts;
    }
});
```

For more advanced usage, see the API section.

The `contracts` object works like the one in `web3.js` and is essentially a "factory factory" for javascript contracts. You call it and pass a JSON ABI file, and get a factory (or template) for that particular contract type in return, which you then use to create instances that points to actual on-chain contract accounts.


There is two ways of using these factories/templates - one is to create a javascript contract and at the same time deploy a corresponding solidity contract. This is done using `new`:

``` javascript
var myAbi = [...];
var myCompiledCode = "...";

// Create factory from abi.
var myContractFactory = contracts(myAbi);

// To create a new instance and simultaneously deploy a contract use `new`:
var myNewContract;
myContractFactory.new({data: myCompiledCode}, function(error, contract){
    if (error) {
        // Something.
        throw error;
    }
    myNewContract = contract;
});
```

You may also create a new javascript contract and point it to an already existing solidity contract account using `at`:

``` javascript
var contractAddress = "...";

var myExistingContract;

myContractFactory.at(contractAddress, function(error, contract){
    if (error) {
        // Something.
        throw error;
    }
    myExistingContract = contract;
});
```

This is an example solidity contract:

``` javascript
contract MyContract {

  function add(int a, int b) constant returns (int sum) {
      sum = a + b;
  }
}
```

The JSON ABI of that contract would be this:

``` javascript
[{
    "constant":true,
    "inputs":[
    {
        "name":"a",
        "type":"int256"
    },{
        "name":"b",
        "type":"int256"
    }],
    "name":"add",
    "outputs":[{
        "name":"sum",
        "type":"int256"
    }],
    "type":"function"
}]
```

You would access the `add` function from the javascript contract like this:

``` javascript
myContract.add(34, 22, addCallback);

function addCallback(error, sum){
  console.log(sum.toString()); // Would print: 56
}
```

Finally, if you create a contract factory/template using an ABI, and the on-chain contracts that the javascript contracts points to does not use that ABI, the behavior of the javascript contract will be undefined.

## Private Keys and Signing

Eris/Tendermint uses public key cryptography to protect the identity of the users/accounts. Each account has a public key and a private key. The public key (or public address, rather, which is a representation of the public key) is used to identify the account. It may be shown to others in plain-text.

In order to transact from the account (which is required to actually do things), the account holder has to sign data using their private key. The private key should never be exposed to others.

For beginners, it can help to think about the public/private keypair as a username/password combination. The public key (public address) is the name, and the private key is the password. Others will see your username in most systems, but they normally have to provide the password in order to actually do something under that name. This is why private keys should never be exposed.

The exception to the private key rule is if you are testing/developing. It is of course safe to generate a "worthless" key-pair to create test-accounts when developing, since the key is not actually protecting anything of value. It is essentially the same thing as having a test login/password when testing a web-service, or database, or anything else. That is why you may find private keys in things like unit tests.

Even if worthless/throw-away keys are used when developing and testing, it is very important that they are removed before the system goes live, so it is important to handle them with care - even during testing.

## API

At the core of this library is the `Contract` objects. Everything else is utilities for creating the contracts and formatting the input and output.

This is an overview and a short description of most objects. More details can be found in the code (jsdoc). This will later replace the current docs and tutorials on our [main site](https://erisindustries.com).

### eris-contracts (root module)

Eris contracts is what you get when requiring `eris-contracts`. It's a wrapper around the `contracts` module with a few additional utilities. You create contracts using `erisContracts.contracts` or one of its variations. Here's the example from the top:

``` javascript
var erisC = require('eris-contracts');
var erisdbURL = "http://localhost:1337/rpc";
var PrivKey = "...";
var contracts = erisC.contractsDev(erisdbURL, PrivKey);
```

The `contractsDev` method is is just a convenient way of doing all of this:

``` javascript
// Get 'eris-contracts'.
var erisContracts = require('eris-contracts');

// Get 'eris-db' (the javascript API for eris-db)
var erisdbModule = require("eris-db");

// Create a new instance of ErisDB that uses the given URL.
var erisdb = erisdbModule.createInstance("http://localhost:1337/rpc");
// The private key.
var privKey = "...";

// Create a new pipe. 
var pipe = new erisContracts.pipes.DevPipe(erisdb, privKey);
// Create a new contracts object using that pipe.
var contracts = eris.solidityContracts(pipe);
```

#### Pipes

Pipes are used to connect `eris-contracts` with the `eris-db` javascript API. Th purpose of `pipes` is to enable multiple different ways of signing transactions. The `DevPipe` will take a private key which it sends to the server with each transaction so that the server can sign the transaction with the key. This should only be used in dev, or when the node.js server and blockchain client is running on the same machine or a private network.

LocalSignerPipe is for applications where end-users will sign transactions themselves using a key. A signing function can then be passed to a `LocalSignerPipe` and used by `eris-contract`. For now, `DevPipe` is the standard because **we do not yet have the infrastructure in place for local signing**.
 
The pipes are available as `erisContracts.pipes`. It has the `DevPipe`, `LocalSignerPipe` and also the base `Pipe` class in case someone wants to extend it to create their own pipe.

#### Accounts

Accounts are managed via the pipe. The `DevPipe` takes account data in the constructor (as per the example above), but the `Pipe` class comes with a few standard methods as well.
 
`Pipe.addAccount(accountData)` - Add a new account to the list of available accounts. Will throw if the ID is already in use.
`Pipe.removeAccount(accountId)` - Remove the account with the given ID. Will throw if no account with the given ID is found.
`Pipe.setDefaultAccount(accountId)` - Set the account with the given ID as the default account (the account that will be used if no `from` account is added to the call/transaction options). Will throw if no account with the given ID is found.

Account data is context sensitive. For `DevPipe`, which manages the account data in javascript:

AccountData
```
{
    address: <string>
    pubKey: <string>
    privKey: <string>
}
```

In a local signer implementation, account data would likely just be an identifier used for the account (which is managed elsewhere).

### the contracts module

The `contracts` module is the basis for all solidity contracts you create. It lets you create contract factories from Solidity ABI files. The factories are all instances of the `ContractFactory` class.

``` javascript
var myJsonAbi = [...];
var myOtherJsonAbi = [...];
// Create a factory (or contract template) from 'myJsonAbi'
var myContractFactory = contracts(myJsonAbi);

// Create another factory from 'myOtherJsonAbi'
var myOtherContractFactory = contracts(myOtherJsonAbi);
```

### ContractFactory

Instances of `ContractFactory` are used to create instances that point to certain addresses of real contracts that exist on the chain.
 
#### ContractFactory.new(options, callback)

Calling `ContractFactory.new` will create a new instance of `Contract`, but will also deploy the contract onto the chain. The javascript contract will get the address of the newly deployed contract automatically.

``` javascript
var myContract;
var myCode = "...";

myContractFactory.new({data: myCode}, function(error, contract){
    if(error) {throw error}
    myContract = contract;
}); 
```

`options` is defined below.

#### ContractFactory.at(address, callback)

This is used to create a new contract object that points to the address of a contract that is assumed to already exist on the chain.

``` javascript
var address = "...";
var myContract;

myContractFactory.at(address, function(error, contract){
    if(error) {throw error}
    myContract = contract;
});
```

No check is made to see if the contract actually exists, so you may omit the callback and instead get the new contract object as the return-value.

``` javascript
var address = "00000000000000000000000000000000DEADBEEF"
var myContract = myContractFactory.at(address);
```

**Note:** Use this with caution. There's no check if the address points to an actual contract, and if that contract is of the proper type. An existence check may be added later, but an ABI check will be harder since the ABI is not stored in the account that holds the compiled contract-code. 
A check that can be done manually is to first try and get the account at that address (using the core `eris-db.js` library). An even more sophisticated check would be to then get the code from that account and check if it matches the expected code for a contract of that particular type. 

#### options

The transaction options object has the following fields:

`from`: This is used to set the sender account, and must be the account's public address. In the case of transactions you need to have registered the account data with the `pipe` (in the case of `DevPipe`), or with the key daemon (in the case of `LocalSignerPipe` - which is not fully implemented yet). If no account with the given address is found, the function callback will receive an error. When doing a simulated call (i.e. calling a `constant` function), the address you pass in will be used directly.

`to`: The address of the target account. This is **only set internally** as each javascript contracts targets a specific on-chain contract, and the address to that contract was automatically set during creation.

`data` : The transaction data. For a user, this is **only set when creating new contracts**, to pass in the compiled code:

``` javascript
myContractFactory.new({data: myCode}, function(error, contract){
    if(error) {throw error}
    myContract = contract;
}); 
```

In a contract function, the options object must be added right before the callback. If no such object is added, it will use the default `from` address that was added to the pipe, the `to` value is set by the contract in question, and `data` is set by the function in question.

`contract.someConstFunc(arg0, arg1, ... , argN, {from: fromAddress}, callbackFn);`

### Contract

Contracts are always created using factory methods. They will have their methods and events set based on the ABI that was used when creating the factory. Here is an example contract:

```
contract TestContract {
    
    address public testAddress;
    
    event AddressSet(boolean indexed itWasSet);

    function getInts() external constant returns (int a, int b){
        a = -10;
        b = -50;
        AddressSet(false);
    }

    function getUints() external constant returns (uint a, uint b){
        a = 10;
        b = 50;
        AddressSet(false);
    }
    
    function setAddress(address addressIn) external {
        testAddress = addressIn;
        AddressSet(true);
    }

}
```

The corresponding javascript-contract would have the following methods:

`Contract.getInts(callback)` returns `[BigNumber, BigNumber]`
`Contract.getUints(callback)` returns `[BigNumber, BigNumber]`
`Contract.setAddress(string, callback)` returns `-`

And finally, since `testAddress` is public:

`Contract.testAddress(callback)` returns `[string]`

It would have the following event as well:

`Contract.AddressSet(startCallback, eventCallback)`

#### constant vs non-constant

The `constant` modifier for solidity functions denotes that the function does not modify the world state in any way what-so-ever. What this means is it does not write to any storage variable in any contract or transfer any tokens between accounts (e.g. Ether in the case of Ethereum). They could be referred to as "read-only".

Constant functions can be evaluated without the caller having to sign anything using their key, which means it does not need to wait for a block to be mined to process the results. If a function is indeed read-only, it should always have the constant modifier. 

Currently, `constant` is not enforced by the compiler, but it will be. It is implemented on the javascript side though, and functions that are flagged as constant will be invoked using the `call` method of the RPC library rather then `transact`. `call` does not use the the private key and does not count towards the account nonce/sequence; it simply executes the code and passes any return value back at once.

You may override this by using the `call` and `sendTransaction` methods, although that support may be removed. There is almost never a good reason to do this with `eris-db`. They take the same params as the base methods. 

These are examples of overriding the default behavior, and also examples of **what not to do**.

``` javascript
// Transact to a constant method - bad.
myContract.getInts.sendTransaction(function(error, data){});

// Call a non-constant method - bad.
myContract.setAddress.call("..", function(error, data){});
```

#### Events

Events are called like this:

``` javascript
myContract.MyEvent(startCallback, eventCallback);
```

`startCallback` is error-first, and returns the subscription management object as the second param.

`eventCallback` is error-first, and returns an event object as the second param. It is fired off every time a new event comes in.

The `startCallback` can be omitted to create a `once` subscription i.e. a subscription that will close down automatically when the first event is received. There's an alternative syntax for this as well which makes the intentions a bit more clear: `myContract.MyEvent.once(eventCallback)`. 

**Note**: If the backing `eris-db` object uses a websocket connection, events will come in as they happen. If it uses a HTTP connection then the subscription object will poll for events once every second (by default). It will then fire the callback once for each new event (if any), in the same order they came in. If you have lots of event activity and use HTTP, don't set the polling interval too high or you will have long periods of inactivity followed by a burst of new events.

##### The Event object

Event objects are on the following form:

``` javascript
{
    "event" : <string>
    "address" : <string>
    "args" : {}
}
```

`event` is the name of the event.

`address` is the address of the contract that fired off the event.

`args` is a map where the event parameter names are the keys, and their values the values. In the `AddressSet`-event, the `args` object would look like this:

``` javascript
{
    "itWasSet" : <boolean>
}
```

##### The Subscription object

A subscription object in `eris-contracts` is mostly just used to stop subscriptions. They are automatically started when created, and the eventId/subId is not needed either, so you mostly just use the `stop` method when working with `eris-contracts`.

`EventSub.stop(callback)`: stop subscribing. `callback(error)` is optional, and can be used to check for errors.

It also has the following methods:

`EventSub.getEventId`: Get the event-id used for this subscription. For solidity events it is always on the form: `Log/<address>`, where `address` is the address of the contract account.

`EventSub.getSubscriberId`: A unique 32 byte hex string identifier for the subscription.

##### Example

This is an example of a trivial module that handles this event on one single contract of this type:

``` javascript
var addressSetSub;
var myContract;

exports.subToAddressSet = function(contract){
    myContract = contract;

    myContract.AddressSet(startCallback, eventCallback);

    function startCallback(error, eventSub){
        if(error){ 
            throw error;
        }
        addressSetSub = eventSub;
    }

    function eventCallback(error, event){
        console.log("Address was " + (event.args.itWasSet ? "" : "not ") + "set in: " event.address); 
    }
}

exports.stop = function(){
    if(addressSetSub){
        // Optional callback.
        addressSetSub.stop(function(error){
            if(error){
                console.error("Failed to stop sub for: " + myContract.address + ". Error: " + error.message);
            } else {
                console.log("Info: Stopped watching AddressSet events on: " + myContract.address);
            }
        });
    } else {
        console.log("Warning: No subscription has been started!"); 
    }
}

```

## eris-contracts.js and web3.js (for Ethereum users)

If you have done dapp-development with `web3.js`, you'll quickly learn how to use `eris-contracts.js`, but there are some important differences.
 
### Method callbacks

You **must** use callbacks with `eris-contracts`. In `web3`, you may omit the callback and do a regular try-catch + return.

``` javascript
var sum;

try{
    sum = myContract.add(34, 22);
    // more synchronous calls perhaps
    // ...
} catch (error) {
    // ...
}
```

The reason is because they allow blocking http calls to be made. `eris-contracts` only works with `node.js` for now (mainly as server side script). This restriction might be removed when browser support is added.

### Events

In `eris-contracts` you do not use watches and filters, but events. See the event section above for instructions.

### Transacting / calling

Transacting and calling is done via the javascript contract objects, but the mechanics is slightly different. Ethereum keeps the accounts in the client, while our client (Tendermint) expects the account info, such as private keys or pre-signed transactions, to be provided by the caller. See the section on `pipes` for more info.

## Tests

`mocha` or `npm test`

## Web3 licence

This library is built on [web3.js](https://github.com/ethereum/web3.js). Here is the web3.js licence:

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