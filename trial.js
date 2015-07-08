// Dependencies assuming we're in eris-contracts.js root. Otherwise modify.
var edbModule = require("eris-db");
var DevPipe = require('./lib/pipes/dev_pipe');
// Yes, it is a factory factory right now. Ethereums fault.
var cff = require('./index');

// The private key to use.
var testPrivKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906"

// Create a new edb at whatever url is appropriate (localhost:1337 is the default).
var edb = edbModule.createInstance("http://localhost:1337/rpc");
// Create the dev_pipe, which is the pipe that uses edb's transact method (the one which takes a private key for signing).
var pipe = new DevPipe(edb, testPrivKey);
// Create the contracts object.
var contracts = cff.createInstance(pipe);

var myAbi = [{"constant":false,"inputs":[],"name":"get","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"input","type":"bytes32"}],"name":"set","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}];

//var myCompiledCode = "60606040525B63FEEDFACE6001026000600050819055505B60908060246000396000F30060606040526000357C0100000000000000000000000000000000000000000000000000000000900480636D4CE63C146041578063DB80813F14606057603F565B005B604A600450607F565B6040518082815260200191505060405180910390F35B606F6004803590602001506071565B005B806000600050819055505B50565B60006000600050549050608D565B9056";
var myCompiledCode = "60606040525b7f46454544464143450000000000000000000000000000000000000000000000006000600050819055505b609080603d6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480636d4ce63c146041578063db80813f14606057603f565b005b604a600450607f565b6040518082815260200191505060405180910390f35b606f6004803590602001506071565b005b806000600050819055505b50565b60006000600050549050608d565b9056";
// Create factory from abi.
var contractFactory = contracts(myAbi);

// To create a new contract (actually deploy and wait for the contract to be committed to a block etc.) use  `new`:
var myContract;
console.log("whatup?")
contractFactory.new({data: myCompiledCode}, function(error, contract){
    if (error) {
        // Just do something.
        console.log("You messed up");
        throw error;
    }
    console.log(contract.toString());
    myContract = contract;

    //Do some shit?

	console.log("giddyup!")

	contract.get.call(function(error, dats){
		console.log("get!")
		console.log(dats)
		var res = dats.toString();
	    console.log(res);
	});
});