var edbModule = require('eris-db');
var asrt = require('assert');
var EdbMockClient = require('eris-db/test/mock/mock_client');
var contractModule = require('../index');
var DevPipe = require('../lib/pipes/dev_pipe');

var edbMockClient = new EdbMockClient();
var edb = edbModule.createInstanceFromClient(edbMockClient);

var abi = [{
    "name": "balance(address)",
    "type": "function",
    "inputs": [{
        "name": "who",
        "type": "address"
    }],
    "constant": true,
    "outputs": [{
        "name": "value",
        "type": "uint256"
    }]
}, {
    "name": "send(address,uint256)",
    "type": "function",
    "inputs": [{
        "name": "to",
        "type": "address"
    }, {
        "name": "value",
        "type": "uint256"
    }],
    "outputs": []
}];

var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";
var newAddr = "";

var pipe = new DevPipe(edb, privKey);

var contracts = contractModule.solidityContracts(pipe);

var contractFactory = contracts(abi);

describe('TestCreate', function () {

    it("should create a contract using mock eris-db", function (done) {
        contractFactory.new({to: newAddr, data: ""}, function (error, contract) {
            if (error) {
                throw error;
            }
            asrt.equal(contract.address, "9FC1ECFCAE2A554D4D1A000D0D80F748E66359E3");
            done();
        });
    });

});