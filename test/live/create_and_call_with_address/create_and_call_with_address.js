/* This file is for testing a contract create + call.
 */
var util = require('eris-db/lib/util');
var BigNumber = require('bignumber.js');
var asrt = require('assert');
var edbModule = require("eris-db");
var eris = require('../../../index');

var serverServerURL = "http://localhost:1337/server";

var test_data = require('eris-db/test/testdata/testdata.json');

var requestData = {
    priv_validator: test_data.chain_data.priv_validator,
    genesis: test_data.chain_data.genesis,
    max_duration: 30
};

var abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getMyAddress",
        "outputs": [
            {
                "name": "callerAddress",
                "type": "address"
            }
        ],
        "type": "function"
    }
];

var code = "606060405260788060116000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480639a166299146037576035565b005b6040600450606c565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60003390506075565b9056";

var address = "1234123412341234123412341234123412341234";
var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";

var address2 = '0000000000000000000000000000000000001234';

var contract;

describe('TestCreateAndCallWithAddress', function () {

    before(function (done) {

        this.timeout(5000);
        var edb = edbModule.createInstance("ws://localhost:1337/socketrpc");

        edb.start(function (error) {
            if (error) {
                throw error;
            }
            var pipe = new eris.pipes.DevPipe(edb, {address: address, privKey: privKey});
            var contracts = eris.newContractManager(pipe);
            console.log("Creating. This should take a couple of seconds.");
            var contractFactory = contracts.newContractFactory(abi);
            contractFactory.new({data: code}, function (error, data) {
                if (error) {
                    console.log("New contract error");
                    console.log(error);
                    throw error;
                }
                contract = data;
                done();
            });
        });
    });

    describe('getMyAddress', function () {

        it("should return the address '" + address + "'", function (done) {
            contract.getMyAddress(function (error, data) {
                asrt.ifError(error);
                asrt.equal(data, address);
                done();
            });
        });

        it("should return the address '" + address2 + "'", function (done) {
            contract.getMyAddress({from: address2},function (error, data) {
                asrt.ifError(error);
                asrt.equal(data, address2);
                done();
            });
        });

    });

});