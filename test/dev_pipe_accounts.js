var asrt = require('assert');
var erisC = require('../index');
var mockEdb = require('./mock/mock_edb').createInstance();

describe('TestContract', function () {

    it("should allow devpipe to be created without accounts.", function () {
        asrt.doesNotThrow(function () {
                var devPipe = new erisC.pipes.DevPipe(mockEdb);
            },
            Error,
            "Failed to create devpipe with no accounts."
        );
    });

    it("should convert a (deprecated) private key string to an account and add to devpipe.", function () {
        var account = "00000000";
        var devPipe;
        asrt.doesNotThrow(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, account);
            },
            Error,
            "Failed to add devpipe and convert private key string to account."
        );
        asrt.ok(devPipe.hasAccount("0000000000000000000000000000000000000000"), "privKey string was not added to accounts.");
    });

    it("should add an account to devpipe.", function () {
        var account = {address: "DEADBEEF", pubKey: "0000", privKey: "0000000000"};
        var devPipe;
        asrt.doesNotThrow(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, account);
            },
            Error,
            "Failed to add devpipe account."
        );
        asrt.ok(devPipe.hasAccount("DEADBEEF"), "does not have DEADBEEF account.");
    });

    it("should add an array of accounts to devpipe.", function () {
        var account = {address: "DEADBEEF", pubKey: "0000", privKey: "0000000000"};
        var account2 = {address: "FEEDFACE", pubKey: "12340000", privKey: "0010512350051200000"};
        var devPipe;
        asrt.doesNotThrow(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, [account, account2]);
            },
            Error,
            "Failed to add devpipe accounts."
        );
        asrt.ok(devPipe.hasAccount("DEADBEEF"), "does not have DEADBEEF account.");
        asrt.ok(devPipe.hasAccount("FEEDFACE"), "does not have FEEDFACE account.");
    });

    it("should add an account with typed fields to devpipe.", function () {
        var account = {address: [1, "DEADBEEF"], pubKey: [1, "0000"], privKey: [1, "0000000000"]};
        var devPipe;
        asrt.doesNotThrow(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, account);
            },
            Error,
            "Failed to add devpipe account."
        );
        asrt.ok(devPipe.hasAccount("DEADBEEF"), "does not have DEADBEEF account.");
    });

    it("should reject an account with no 'address' field.", function () {
        var account = {addressss: "DEADBEEF", pubKey: "0000", privKey: "0000000000"};
        var devPipe;
        asrt.throws(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, account);
            },
            "malformed account added."
        );
    });

    it("should reject an account with no 'privKey' field.", function () {
        var account = {address: "DEADBEEF", pubKey: "0000", prasdfivKey: "0000000000"};
        var devPipe;
        asrt.throws(function () {
                devPipe = new erisC.pipes.DevPipe(mockEdb, account);
            },
            "malformed account added."
        );
    });

});