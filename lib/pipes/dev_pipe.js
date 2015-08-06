/**
 * @file dev_pipe.js
 * @fileOverview Base class for the dev-pipe.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module pipe/dev_pipe
 */
'use strict';

var Pipe = require('./pipe');
var nUtil = require('util');
var config = require('../utils/config');

/**
 * Constructor for the DevPipe class.
 *
 * @type {Pipe}
 */
module.exports = DevPipe;

/**
 * DevPipe transacts using the unsafe private-key transactions.
 *
 * @param {*} erisdb - the erisdb object.
 * @param {string} accountData - the private key to use when sending transactions. NOTE: This means a private key
 * will be passed over the net, so it should only be used when developing, or if it's 100% certain that the
 * eris-db server and this script runs on the same machine, or communication is secure. The recommended way
 * will be to call a signing function on the client side, like in a browser plugin.
 *
 * @constructor
 */
function DevPipe(erisdb, accountData) {
    Pipe.call(this, erisdb);
    var ad;
    if(typeof(accountData) === "string"){
        // Interpreted as a private key.
        ad = {
            address: "",
            privKey: accountData
        }
    } else {
        ad = accountData;
    }
    this._accountData = ad;
}

nUtil.inherits(DevPipe, Pipe);

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback. The 'data' param is a contract address in the case of a
 * create transactions, otherwise it's the return value.
 */
DevPipe.prototype.transact = function (txPayload, callback) {
    var to = txPayload.to;
    this._erisdb.txs().transactAndHold(this._accountData.privKey, to, txPayload.data, config.DEFAULT_GAS, config.DEFAULT_FEE, null, function (error, data) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            if(to) {
                callback(null, data.return);
            } else {
                callback(null, data.call_data.callee);
            }
        }
    });
};

/**
 * Used to do a call.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
DevPipe.prototype.call = function (txPayload, callback) {
    var address = txPayload.to;
    if (address.length > 1 && address.slice(0,2) == '0x'){
        address = address.slice(2);
    }
    var data = txPayload.data;
    if (data.length > 1 && data.slice(0,2) == '0x'){
        data = data.slice(2);
    }
    this._erisdb.txs().call(this._accountData.address, address, data, function(error, data){
        if(error) {
            callback(error);
        } else {
            callback(null, data.return.toUpperCase());
        }
    });
};