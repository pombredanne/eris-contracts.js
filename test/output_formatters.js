var asrt = require('assert');
var erisC = require('../index.js');
var BigNumber = require('bignumber.js');

var abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "getAddress",
        "outputs": [
            {
                "name": "addressVal",
                "type": "address"
            }
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getUint",
        "outputs": [
            {
                "name": "uintVal",
                "type": "uint256"
            }
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getBool",
        "outputs": [
            {
                "name": "boolVal",
                "type": "bool"
            }
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getBytes32",
        "outputs": [
            {
                "name": "bytes32Val",
                "type": "bytes32"
            }
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getComposite",
        "outputs": [
            {
                "name": "addressVal",
                "type": "address"
            },
            {
                "name": "uintVal",
                "type": "uint256"
            },
            {
                "name": "boolVal",
                "type": "bool"
            },
            {
                "name": "bytes32Val",
                "type": "bytes32"
            }
        ],
        "type": "function"
    }
];

var addressVal = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var uintVal = new BigNumber(-55);
var boolVal = true;
var bytes32Val = 0x12345;

var getAddressRet = {
    values: {addressVal: addressVal},
    raw: [addressVal]
};

var getUintRet = {
    values: {uintVal: uintVal},
    raw: [uintVal]
};

var getBoolRet = {
    values: {boolVal: boolVal},
    raw: [boolVal]
};

var getBytes32Ret = {
    values: {bytes32Val: bytes32Val},
    raw: [bytes32Val]
};

var getCompositeRet = {
    values: {addressVal: addressVal, uintVal: uintVal, boolVal: boolVal, bytes32Val: bytes32Val},
    raw: [addressVal, uintVal, boolVal, bytes32Val]
};

describe('TestJsonFormatter', function () {

    var jsonFormatter = erisC.outputFormatters.json;

    it("should format address output.", function () {
        var ret = jsonFormatter(abi[0].outputs, [addressVal]);
        asrt.deepEqual(ret, getAddressRet, "Address return value does not match.");
    });

    it("should format uint output.", function () {
        var ret = jsonFormatter(abi[1].outputs, [uintVal]);
        asrt.deepEqual(ret, getUintRet, "Uint return value does not match.");
    });

    it("should format boolean output.", function () {
        var ret = jsonFormatter(abi[2].outputs, [boolVal]);
        asrt.deepEqual(ret, getBoolRet, "Boolean return value does not match.");
    });

    it("should format address output.", function () {
        var ret = jsonFormatter(abi[3].outputs, [bytes32Val]);
        asrt.deepEqual(ret, getBytes32Ret, "Bytes32 return value does not match.");
    });

    it("should format composite output.", function () {
        var ret = jsonFormatter(abi[4].outputs, [addressVal, uintVal, boolVal, bytes32Val]);
        asrt.deepEqual(ret, getCompositeRet, "Composite return value does not match.");
    });

});