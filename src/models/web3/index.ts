/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * ***** END LICENSE BLOCK ***** */

import { history } from 'webpkit/lib/router';
import { Web3, MultipleProvider } from 'web3-tx';
import { MemoryTransactionQueue } from 'web3-tx/queue';
import buffer from 'somes/buffer';

const AbiCoder = require('web3-eth-abi');
const crypto_tx = require('crypto-tx');

export function encodeParameters(types: any[], paramaters: any[]) {
	return AbiCoder.encodeParameters(types, paramaters);
}

export class Web3IMPL extends Web3 {

	private _metaMask: any;
	private _txQueue: MemoryTransactionQueue = new MemoryTransactionQueue(this);
	private _defaultAccount?: string;

	get metaMask() {
		if (!this._metaMask) {
			this._metaMask = (globalThis as any).ethereum;
			// check _metaMask
			if (!this._metaMask) {
				history.push('/install');
				throw Error.new('Matemask wallet needs to be installed');
			}
			var currentChainId = this._metaMask.chainId;
			console.log('currentChainId', currentChainId);
		}
		return this._metaMask;
	}

	get queue() {
		return this._txQueue;
	}

	defaultProvider() {
		return this.metaMask;
		// return 'http://hw1.ngui.fun:7777';
		// return 'http://114.115.155.154:7777'
	}

	async setDefaultAccount() {
		if (!this._defaultAccount) {
			var mask = this.metaMask;
			var [from] = await mask.request({ method: 'eth_requestAccounts' });

			console.log('eth_requestAccounts', from);

			if (from) {
				from = '0x' + crypto_tx.toChecksumAddress(buffer.from(from.slice(2), 'hex'));
			}
			this._defaultAccount = (from || '') as string;
			this.raw.defaultAccount = this._defaultAccount;
		}
		return this._defaultAccount;
	}

	async initialize() {
		if (await isSupport()) {
			await this.setDefaultAccount();
		}
	}

}

export async function isSupport() {
	return !!(globalThis as any).ethereum;
}

export default new Web3IMPL;
