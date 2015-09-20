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
        "name": "uintVal",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "input",
                "type": "uint256"
            }
        ],
        "type": "constructor"
    }
];

var code = "606060405260405160208060948339016040526060805190602001505b806000600050819055505b50605f8060356000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480639a0283ed146037576035565b005b60406004506056565b6040518082815260200191505060405180910390f35b6000600050548156";

var privKey = "6B72D45EB65F619F11CE580C8CAED9E0BADC774E9C9C334687A65DCBAD2C4151CB3688B7561D488A2A4834E1AEE9398BEF94844D8BDBBCA980C11E3654A45906";

var contracts;
var contractFactory;
var contract;

describe('TestCreateWithParams', function () {

    before(function (done) {
        util.getNewErisServer(serverServerURL, requestData, function (err, port) {
            if (err) {
                throw err;
            }
            var edb = edbModule.createInstance("http://localhost:" + port + '/rpc');
            var pipe = new eris.pipes.DevPipe(edb, privKey);
            contracts = eris.newContractManager(pipe);
            contractFactory = contracts.newContractFactory(abi);
            done();
        })
    });

    describe('ConstructorWithParams', function () {
        this.timeout(8000);
        it("should set uintVal to 55 via constructor param.", function (done) {
            contractFactory.new(55, {data: code}, function (error, data) {
                if (error) {
                    throw error;
                }
                contract = data;
                contract.uintVal(function (error, data) {
                    asrt.ifError(error);
                    var res = data.toString();
                    console.log(res);
                    asrt.equal(res, "55");
                    done();
                });
            });
        });

    });

});