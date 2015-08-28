
/*
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
        "name": "intVal",
        "outputs": [
            {
                "name": "",
                "type": "int128"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [],
        "type": "constructor"
    }
];

var code = "60606040525b6001600060006101000a8154816fffffffffffffffffffffffffffffffff02191690837001000000000000000000000000000000009081020402179055505b606c8060516000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806382a35c77146037576035565b005b60406004506059565b6040518082600f0b815260200191505060405180910390f35b600060009054906101000a9004600f0b8156";

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
            contracts = eris.contracts(pipe);
            console.log("Creating. This should take about 15 seconds.");
            var contractFactory = contracts(abi);
            contractFactory.new({data: code}, function (error, data) {
                if (error) {
                    throw error;
                }
                contract = data;
                done();
            });
        })
    });

    describe('get multiple of 8 ints', function () {

        it("should call intVal and get the proper int", function (done) {
            contract.intVal(function (error, data) {
                asrt.ifError(error);
                var res = data.toString();
                console.log(res);
                //asrt.equal(res, "30");
                done();
            });
        });

    });

});
    */