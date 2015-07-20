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
        "constant": false,
        "inputs": [
            {
                "name": "bytes32In",
                "type": "bytes32"
            }
        ],
        "name": "setTestBytes32",
        "outputs": [
            {
                "name": "bytes32Prev",
                "type": "bytes32"
            },
            {
                "name": "bytes32New",
                "type": "bytes32"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [],
        "type": "constructor"
    }
];

var code = "6060604052670123456789abcdef6001026000600050555b5b608e8060256000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480637d3a8eff146037576035565b005b60466004803590602001506063565b604051808381526020018281526020019250505060405180910390f35b600060006000600050549150815082600060005081905550600060005054905080506089565b91509156";

var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";

var contracts;
var contract;

describe('TestCreateAndTransact', function () {

    before(function (done) {
        this.timeout(25000);
        util.getNewErisServer(serverServerURL, requestData, function (err, port) {
            if (err) {
                throw err;
            }
            var edb = edbModule.createInstance("http://localhost:" + port + '/rpc');
            var pipe = new eris.pipes.DevPipe(edb, privKey);
            contracts = eris.solidityContracts(pipe);
            console.log("Creating. This should take about 15 seconds.");
            var contractFactory = contracts(abi);
            contractFactory.new({data: code}, function (error, data) {
                if (error) {
                    console.log("New contract error");
                    console.log(error);
                    throw error;
                }
                contract = data;
                done();
            });
        })
    });

    describe('setTestBytes32', function () {
        var input = 0xDEADBEEF;
        var expected = ['0000000000000000000000000000000000000000000000000123456789ABCDEF',
            '00000000000000000000000000000000000000000000000000000000DEADBEEF'];

        this.timeout(25000);
        it("should set the bytes in the contract to 0xdeadbeef", function (done) {
            contract.setTestBytes32(input, function (error, output) {
                asrt.ifError(error);
                asrt.deepEqual(output, expected);
                done();
            });
        });

    });

});