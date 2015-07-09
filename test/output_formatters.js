var asrt = require('assert');
var func = require('../lib/solidity/function');

describe('TestFormatters', function () {

    it("should create a contract and simulate an event fired upon calling.", function (done) {

        contractFactory.new({to: newAddr, data: ""}, function (error, contract) {
            asrt.equal(contract.address, "9FC1ECFCAE2A554D4D1A000D0D80F748E66359E3", "Contract address wrong.");
            asrt.deepEqual(contract.abi, abi, "Contract abi not matching expected.");
            contract.Added(function(error, event){
                asrt.ifError(error);
                asrt.equal(event.event, "Added");
                asrt.equal(event.address.slice(24), contract.address);
                var a = event.args.a.toString();
                var b = event.args.b.toString();
                var sum = event.args.sum.toString();
                asrt.equal(sum, "30");
                done();
            });
            contract.add(5, 25, function (error, data) {
                asrt.equal(data.toString(), '30');
            });

        });
    });

    it("should create a contract and simulate an event fired upon calling.", function (done) {

        contractFactory.setOutputFormatter(erisC.outputFormatters.json);
        contractFactory.new({to: newAddr, data: ""}, function (error, contract) {

            asrt.equal(contract.address, "9FC1ECFCAE2A554D4D1A000D0D80F748E66359E3", "Contract address wrong.");
            asrt.deepEqual(contract.abi, abi, "Contract abi not matching expected.");

            contract.Added(function(error, event){
                asrt.ifError(error);
                asrt.equal(event.event, "Added");
                asrt.equal(event.address.slice(24), contract.address);
                var a = event.args.a.toString();
                var b = event.args.b.toString();
                var sum = event.args.sum.toString();
                asrt.equal(sum, "30");
                done();
            });

            contract.add(5, 25, function (error, data) {
                console.log(data);
                asrt.equal(data.toString(), '30');
            });

        });
    });

});