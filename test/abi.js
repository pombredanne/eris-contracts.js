var chai = require('chai');
var assert = chai.assert;
var SolidityFunction = require('../lib/solidity/function');
var sha3 = require('../lib/utils/sha3');

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
}, {
    "name": "testArr(int[])",
    "type": "function",
    "inputs": [{
        "name": "value",
        "type": "int[]"
    }],
    "constant": true,
    "outputs": [{
        "name": "d",
        "type": "int"
    }]
}, {
    "name": "testByteArr(bytes32[])",
    "type": "function",
    "inputs": [{
        "name": "value",
        "type": "bytes32[]"
    }],
    "constant": true,
    "outputs": [{
        "name": "d",
        "type": "int"
    }]
}];

var tests = [
    {
        address: "0x2222222222222222222222222222222222222222",
        params: ["0x1234123412341234123412341234123412341234"],
        expectedName: "balance",
        expectedData: "E3D670D70000000000000000000000001234123412341234123412341234123412341234"
    },
    {
        address: "0x2222222222222222222222222222222222222222",
        params: ["0x1234123412341234123412341234123412341234", 75],
        expectedName: "send",
        expectedData: "D0679D340000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000004B"
    },
    {
        address: "0x2222222222222222222222222222222222222222",
        params: [[5, 4, 3, 2, 1]],
        expectedName: "testArr",
        expectedData: "C00C1C370000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
    }
];

var testsFail = [
    {
        address: "0x2222222222222222222222222222222222222222",
        params: [7],
        expectedName: "balance",
        expectedData: "E3D670D70000000000000000000000001234123412341234123412341234123412341234"
    },
    {
        address: "0x2222222222222222222222222222222222222222",
        params: ["0x1234123412341234123412341234123412341234", "gavofyork"],
        expectedName: "send",
        expectedData: "D0679D340000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000004B"
    },
    {
        address: "0x2222222222222222222222222222222222222222",
        params: [[5, 4, 3, "gavofyork", 1]],
        expectedName: "testArr",
        expectedData: "C00C1C370000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001"
    }
];

describe('lib/solidity/function', function () {

    describe('success', function () {
        for (var i = 0; i < tests.length; i++) {
            var funcAbi = abi[i];
            var testData = tests[i];
            (function (funcAbi, testData) {
                it('should create a solidity function.', function () {
                    var sFun = new SolidityFunction(funcAbi, testData.address);
                    assert.equal(sFun.displayName(), testData.expectedName);
                    var payload = sFun.toPayload(testData.params);
                    assert.equal(payload.to, testData.address);
                    assert.equal(payload.data, testData.expectedData);
                    assert.equal(sFun.signature(), sha3(funcAbi["name"]).slice(0, 8));
                });
            })(funcAbi, testData)
        }
    });

    describe('fail', function () {
        for (var i = 0; i < tests.length; i++) {
            var funcAbi = abi[i];
            var testData = testsFail[i];
            (function (funcAbi, testData) {
                it('should create a solidity function and fail to format the data.', function () {
                    var sFun = new SolidityFunction(funcAbi, testData.address);
                    assert.throws(function () {
                            sFun.toPayload(testData.params);
                        });
                });
            })(funcAbi, testData)
        }
    });
});