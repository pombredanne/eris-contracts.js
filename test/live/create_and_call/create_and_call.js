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
        "inputs": [
            {
                "name": "a",
                "type": "int256"
            },
            {
                "name": "b",
                "type": "int256"
            }
        ],
        "name": "add",
        "outputs": [
            {
                "name": "sum",
                "type": "int256"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [],
        "type": "constructor"
    }
];

var code = "60606040525b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b60d38061003f6000396000f30060606040523615603a576000357c010000000000000000000000000000000000000000000000000000000090048063a5f3c23b14609757603a565b606b5b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506068565b90565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60ac60048035906020018035906020015060c2565b6040518082815260200191505060405180910390f35b6000818301905060cd565b9291505056";

var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";

var contracts;
var contract;

describe('TestCreateAndCall', function () {

    before(function (done) {
        this.timeout(25000);
        util.getNewErisServer(serverServerURL, requestData, function (err, port) {
            if (err) {
                throw err;
            }
            var edb = edbModule.createInstance("http://localhost:" + port + '/rpc');
            var pipe = new eris.pipes.DevPipe(edb, privKey);
            contracts = eris.newContractManager(pipe);
            console.log("Creating. This should take about 15 seconds.");
            var contractFactory = contracts.newContractFactory(abi);
            contractFactory.new({data: code}, function (error, data) {
                if (error) {
                    throw error;
                }
                contract = data;
                done();
            });
        })
    });

    describe('add', function () {

        it("should add 5 and 25", function (done) {
            contract.add(5, 25, function (error, data) {
                asrt.ifError(error);
                var res = data.toString();
                asrt.equal(res, "30");
                done();
            });
        });

        it("should add 256 and 33", function (done) {
            contract.add(256, 33, function (error, data) {
                asrt.ifError(error);
                var res = data.toString();
                asrt.equal(res, "289");
                done();
            });
        });

        it("should add 15 and -3", function (done) {
            contract.add(15, -3, function (error, data) {
                asrt.ifError(error);
                var res = data.toString();
                asrt.ok(res, "12");
                done();
            });
        });

        it("should add -15 and 3", function (done) {
            contract.add(-15, 3, function (error, data) {
                asrt.ifError(error);
                var res = data.toString();
                asrt.equal(res, "-12");
                done();
            });
        });

    });

});