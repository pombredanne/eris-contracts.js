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
 * @param {string} privKey - the private key to use when sending transactions. NOTE: This means a private key
 * will be passed over the net, so it should only be used when developing, or if it's 100% certain that the
 * eris-db server and this script runs on the same machine, or communication is secure. The recommended way
 * will be to call a signing function on the client side, like in a browser plugin.
 *
 * @constructor
 */
function DevPipe(erisdb, privKey) {
    Pipe.call(this, erisdb);
    this._privKey = privKey;
}

nUtil.inherits(DevPipe, Pipe);

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
DevPipe.prototype.transact = function (txPayload, callback) {
    if(txPayload.to){
        this._transact(txPayload, callback);
    } else {
        this._transactCreate(txPayload, callback);
    }
};

DevPipe.prototype._transact = function(txPayload, callback) {

    var that = this;
    var eventSub;
    var txRet;

    // Regular tx. Handling sub manually.
    that._erisdb.events().subAccountReceive(txPayload.to, function (error, sub) {
        if (error) {
            callback(error);
            return;
        }
        eventSub = sub;
        // Send the transaction.
        that._erisdb.txs().transact(that._privKey, txPayload.to, txPayload.data, config.DEFAULT_GAS, config.DEFAULT_FEE, null, function (error, data) {
            if (error) {
                console.log(error);
                callback(error);
            } else {
                txRet = data;
            }
        });
    }, function (error, event) {
        if (error) {
            console.log(error);
            callback(error);
        } else if (event) {
            if (txRet && event.tx_id === txRet.tx_hash) {
                if (event.exception) {
                    callback(new Error("Error when transacting to contract at '" + txPayload.to + "': " + event.exception));
                } else {
                    callback(null, event.return);
                }
                eventSub.stop();
            }
        }
    });
};

DevPipe.prototype._transactCreate = function(txPayload, callback){

    var that = this;
    var txRet;

    this._erisdb.txs().transact(this._privKey, txPayload.to, txPayload.data, config.DEFAULT_GAS, config.DEFAULT_FEE, null, function (error, data) {
        if (error) {
            console.log(error);
            callback(error);
            return;
        }
        txRet = data;
        // Contract creation. We need the return value from the transaction to set up a sub, because it
        // contains the address to the new contract. Tx is not concluded until we get a confirmation from
        // the server that the tx has either been commited succesfully or failed.
        that._erisdb.events().subAccountReceive(data.contract_addr, function (error, data) {
            if (error) {
                console.log(error);
                callback(error);
            } else if (data.exception) {
                callback(new Error("Error when deploying contract: " + data.exception));
            } else {
                callback(null, txRet.contract_addr);
            }
        });

    });
};