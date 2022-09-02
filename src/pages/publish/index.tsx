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

import {Page,React, Link} from 'webpkit';
import somes from 'somes';
import Nav from '../../com/nav';
import Footer from '../../com/footer';
import Loading from '../../com/loading';
import Dialog from '../../com/dialog';
// import web3 from '../../models/eth/web3';
import {user,nfts, exchange as ex, encodeParameters} from '../../models';
import buffer from 'somes/buffer';
import {rng} from 'somes/rng';
import * as cfg from '../../../config';
import './index.scss';
import '../../assets/publish.css';

export default class extends Page {

	state = { new_TokenId: ''};

	async _Transfer(token: string, tokenId: string, erc721_name: string) {
		var data_str = encodeParameters(
			['uint16', 'uint16', 'string'], [0, 0, erc721_name]
		);
		var data = buffer.from(data_str.slice(2), 'hex');
		var address = user.addressNoJump();

		try {
			await Loading.show();
			await nfts.safeTransferFrom(token, address, ex.contractAddress, BigInt(tokenId), data);
			Dialog.alert('NFT Swap OK', ()=>(this.history.push('/mynft')));
		} finally {
			Loading.close();
		}
	}

	async _NFTSwap() {
		var token = (this.refs.erc721 as HTMLInputElement).value;
		var tokenId = (this.refs.erc721_id as HTMLInputElement).value;
		// var erc721_name = (this.refs.erc721_name as HTMLInputElement).value;

		var erc721_name = 'unknown';

		await this._Transfer(token, tokenId, erc721_name);

		if (await new Promise((r)=>{
			Dialog.confirm({
				text: (
					<div>
						<div>Transfer complete, sell now?</div>
					</div>
				)
			}, ok=>r(ok));
		})) {
			this.history.push(`/details?token=${token}&tokenId=${tokenId}`);
		}
	}

	async _NEWNFT() {
		var token = nfts.contractAddress;
		var tokenId = '0x' + rng(32).toString('hex');
		var name = (this.refs.nft_name as HTMLInputElement).value;
		var uri = (this.refs.nft_uri as HTMLInputElement).value;

		somes.assert(name, 'Invalid name');
		somes.assert(uri, 'Invalid URI');
		var data_str = encodeParameters(
			['uint16', 'uint16', 'string'], [0, 0, name]
		);
		var data = buffer.from(data_str.slice(2), 'hex');

		try {
			await Loading.show();
			this.setState({ new_TokenId: tokenId });
			var r = await nfts.safeMintURI(token, ex.contractAddress, BigInt(tokenId), uri, data);
			tokenId = String(r.tokenId);
		} finally {
			Loading.close();
		}

		if (await new Promise((r)=>{
			Dialog.confirm({
				text: (
					<div>
						<div>Create success, sell now?</div>
					</div>
				)
			}, ok=>r(ok));
		})) {
			this.history.push(`/details?token=${token}&tokenId=${tokenId}`);
		}
	}

	_Sell() {
		this.history.push('/mynft');
	}

	render() {
		return (
			<div>
				<Nav />

				<div className="pub">
					<div className="txt1">PUBLISH</div>
					<div className="txt2">
						<div>Create new NFT assets</div>
					</div>

					<div className="input1">
						<div>NFT Assets name</div>
						<input ref="nft_name" />
					</div>
					<div className="input1">
						<div>NFT Assets URI</div>
						<input ref="nft_uri" />
					</div>

					<div className="btns">
						<div className="btn" onClick={()=>this._NEWNFT()}>CREATE</div>
					</div>
				</div>

				{cfg.platform == 'eth'?
					<div className="pub">

						<div className="txt2">
							<div>Transfer of external assets</div>
						</div>

						<div className="input1">
							<div>ERC721 Token</div>
							<input ref="erc721" />
						</div>

						<div className="input1">
							<div>ERC721 TokenID</div>
							<input ref="erc721_id" />
						</div>

						{/* <div className="input1">
							<div>NFT Assets name</div>
							<input ref="erc721_name" />
						</div> */}

						<div className="btns">
							<div className="btn" onClick={()=>this._NFTSwap()}>Transfer</div>
						</div>

						{/* <div className="txt3">
							<div>也可以将opensea的ERC721资产转移到 {ex.contractAddress}</div>
						</div> */}

					</div>
					: null
				}

				<Footer/>

			</div>
		);
	}
}