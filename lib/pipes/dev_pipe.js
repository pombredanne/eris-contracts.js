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

    var that = this;
    // If there is a target address, this is a normal transaction. We listen to events from that contract to find out when it's done.
    // WARNING: Things about to get weird.
    // TODO clean this up.
    var eventSub;
    // For now. doing some re-structuring of Tendermint events to make faster event routing, but this works for now.
    var txRet;

    if (txPayload.to) {
        // Regular tx.
        that._erisdb.events().subAccountReceive(txPayload.to, function (error, data) {
            if (error) {
                console.log(error);
                callback(error);
                return;
            }
            eventSub = data;
        }, function (error, event) {
            if (error) {
                console.log(error);
                callback(error);
            } else if (event.exception) {
                callback(new Error("Error when transacting to contract at '" + txPayload.to + "': " + event.exception));
            } else {
                callback(null, event.return);
            }
            eventSub.stop(function () {

            });
        });
    }

    this._erisdb.txs().transact(this._privKey, txPayload.to, txPayload.data, config.DEFAULT_GAS, config.DEFAULT_FEE, null, function (error, data) {

        if (error) {
            console.log(error);
            callback(error);
            // If this is a regular tx the sub will already be setup.
            if(eventSub){
                eventSub.stop(function(){});
            }
            return;
        }
        txRet = data;
        if (!txPayload.to) {

            // Contract creation. We need the return value from the transaction to set up a sub, because it
            // contains the address to the new contract. Tx is not concluded until we get a confirmation from
            // the server that the tx has either been commited succesfully or failed.
            that._erisdb.events().subAccountReceive(txRet.contract_addr, function (error, data) {
                if (error) {
                    console.log(error);
                    callback(error);
                    return;
                }
                eventSub = data;
            }, function (error, data) {
                if (error) {
                    console.log(error);
                    callback(error);
                } else if (data.exception) {
                    callback(new Error("Error when deploying contract: " + data.exception))
                } else {
                    callback(null, txRet.contract_addr);
                }
                eventSub.stop(function () {});
            });
        }
    });

};