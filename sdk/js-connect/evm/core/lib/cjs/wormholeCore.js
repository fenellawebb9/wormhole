"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvmWormholeCore = void 0;
const connect_sdk_1 = require("@wormhole-foundation/connect-sdk");
const _1 = require(".");
const connect_sdk_evm_1 = require("@wormhole-foundation/connect-sdk-evm");
class EvmWormholeCore {
    constructor(network, chain, provider, contracts) {
        this.network = network;
        this.chain = chain;
        this.provider = provider;
        this.contracts = contracts;
        this.chainId = connect_sdk_evm_1.evmNetworkChainToEvmChainId.get(network, chain);
        this.coreIface = _1.ethers_contracts.Implementation__factory.createInterface();
        const address = this.contracts.coreBridge;
        if (!address)
            throw new Error('Core bridge address not found');
        this.coreAddress = address;
        this.core = _1.ethers_contracts.Implementation__factory.connect(address, provider);
    }
    static fromProvider(provider, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, chain] = yield connect_sdk_evm_1.EvmPlatform.chainFromRpc(provider);
            return new EvmWormholeCore(network, chain, provider, config[chain].contracts);
        });
    }
    publishMessage(sender, message) {
        return __asyncGenerator(this, arguments, function* publishMessage_1() {
            const senderAddr = new connect_sdk_evm_1.EvmAddress(sender).toString();
            const txReq = yield __await(this.core.publishMessage.populateTransaction(0, message, 200));
            yield yield __await(this.createUnsignedTx((0, connect_sdk_evm_1.addFrom)(txReq, senderAddr), 'WormholeCore.publishMessage'));
        });
    }
    parseTransaction(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.provider.getTransactionReceipt(txid);
            if (receipt === null)
                return [];
            return receipt.logs
                .filter((l) => {
                return l.address === this.coreAddress;
            })
                .map((log) => {
                const { topics, data } = log;
                const parsed = this.coreIface.parseLog({
                    topics: topics.slice(),
                    data,
                });
                if (parsed === null)
                    return undefined;
                const emitterAddress = (0, connect_sdk_1.toNative)(this.chain, parsed.args.sender);
                return {
                    chain: this.chain,
                    emitter: emitterAddress.toUniversalAddress(),
                    sequence: parsed.args.sequence,
                };
            })
                .filter(connect_sdk_1.isWormholeMessageId);
        });
    }
    createUnsignedTx(txReq, description, parallelizable = false) {
        return new connect_sdk_evm_1.EvmUnsignedTransaction((0, connect_sdk_evm_1.addChainId)(txReq, this.chainId), this.network, this.chain, description, parallelizable);
    }
}
exports.EvmWormholeCore = EvmWormholeCore;
