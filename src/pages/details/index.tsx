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

import {Page,React, ViewController} from 'webpkit';
import somes from 'somes';
import Nav from '../../com/nav';
import Footer from '../../com/footer';
import * as util from '../../util';
import artifacts from '../../models/web3/artifacts';
import {exchange as ex, vote_pool as vp, user, SellingNFTData,NFTAsset,BuyRecord} from '../../models';
import Loading from '../../com/loading';
import Dialog from '../../com/dialog';
import '../../assets/details.css';

const MIN_SELL_PRICE = 0.001;
const MIN_YEAR_DAYS = 1;

class SellDialogCon extends ViewController {

	private static _Instance?: SellDialogCon;

	constructor(props: any) {
		super(props);
		somes.assert(!SellDialogCon._Instance);
		SellDialogCon._Instance = this;
	}

	protected triggerRemove() {
		SellDialogCon._Instance = undefined;
	}

	static get instance() {
		somes.assert(SellDialogCon._Instance);
		return (SellDialogCon._Instance as SellDialogCon).refs as Dict<HTMLInputElement>;
	}

	render() {
		return (
			<div>
				<div className="txt1">Min Sell Price {'>='} {MIN_SELL_PRICE} </div>
				<input className="input1" ref="minSell" />
				<div className="txt1">Max Sell Price {'>= Min Sell Price'}</div>
				<input className="input1" ref="maxSell" />
				<div className="txt1">Input YEAR DAYS {'>='} {MIN_YEAR_DAYS} DAY</div>
				<input className="input1" ref="day" />
			</div>
		);
	}
}

export default class extends Page<{token: string; tokenId: string}> {

	state = {
		data: null as (NFTAsset | null),
		historyBuys: null as (BuyRecord[] | null),
	};

	async _test(selling: SellingNFTData) {
		var fee_plan = artifacts.fee_plan.api;

		console.log('fee_plan.feeToVoterAtFirst', await fee_plan.feeToVoterAtFirst().call());
		console.log('fee_plan.feeToVoter       ', await fee_plan.feeToVoter().call());
		console.log('fee_plan.feeToTeamAtFirst ', await fee_plan.feeToTeamAtFirst().call());
		console.log('fee_plan.feeToTeam        ', await fee_plan.feeToTeam().call());

		var votes = await vp.orderTotalVotes(selling.orderId);
		console.log('vp.orderTotalVotes', votes);
		var formula =
			await fee_plan.formula(selling.order.maxSellPrice, true, votes).call();
		console.log(formula);
	}

	async triggerLoad() {
		try {
			await Loading.show();
			await this._fetchData();
		} finally {
			Loading.close();
		}
	}

	async _fetchData() {
		var data = await ex.assetSellingOf(this.params.token||'', BigInt(this.params.tokenId));
		var historyBuys = data.selling ? await ex.historyBuys(data.selling.orderId): null;
		this.setState({ data, historyBuys });

		// if (data.selling)
		// 	await this._test(data.selling);
	}

	private async _vote(data: NFTAsset) {
		var selling = data.selling as SellingNFTData;
		try {
			var { value, ok } = await new Promise((r)=>{
				Dialog.prompt({ text: 'Input vote count', value }, (value: string, ok: boolean)=>r({value, ok}));
			});
			if (!ok) return;
			await Loading.show();
			await vp.marginVote(selling.orderId, BigInt(value * 1e18));
			Dialog.alert('Vote OK', ()=>this._fetchData());
		} finally {
			Loading.close();
		}
	}

	private async _sell(data: NFTAsset) {
		try {
			var { minSellPrice, maxSellPrice, lifespan, ok } = await new Promise((r)=>{
				Dialog.show({
					text: <SellDialogCon />,
					buttons: {
						'取消': ()=>r({ ok: false } as any),
						'@确定': function() {
							var refs = SellDialogCon.instance;
							var minSellPrice = parseFloat(refs.minSell.value) * 1e18;
							somes.assert(minSellPrice >= MIN_SELL_PRICE * 1e18, 'Invalid min sell price');
							var maxSellPrice = parseFloat(refs.maxSell.value) * 1e18;
							somes.assert(maxSellPrice >= minSellPrice, 'Invalid max sell price');
							var lifespan = BigInt(refs.day.value);
							somes.assert(lifespan >= MIN_YEAR_DAYS, 'Invalid YEAR DAYS');
							r({ minSellPrice, maxSellPrice, lifespan, ok: true });
						}
					}
				});
			});
			if (!ok) return;

			await Loading.show();

			await ex.sell({
				token: data.token,
				tokenId: data.tokenId,
				minSellPrice: BigInt(minSellPrice),
				maxSellPrice: BigInt(maxSellPrice),
				lifespan: lifespan,
			});

			// Dialog.alert('Selling OK', ()=>this._fetchData());
			this._fetchData();
		} finally {
			Loading.close();
		}
	}
	
	private async _buy(data: NFTAsset) {
		var selling = data.selling as SellingNFTData;
		try {
			var { value, ok } = await new Promise((r)=>{
				Dialog.prompt({ text: 'Input price', value }, (value: string, ok: boolean)=>r({value, ok}));
			});
			if (!ok) return;
			await Loading.show();
			await ex.buy(selling.orderId, BigInt(value * 1e18));
			Dialog.alert('BUY OK', ()=>this._fetchData());
		} finally {
			Loading.close();
		}
	}
	
	private async _canEndSell(data: NFTAsset) {
		var selling = data.selling as SellingNFTData;
		try {
			await Loading.show();
			if (!await ex.tryEndBid(selling.orderId))
				return Dialog.alert(`It can't end`);
			this._fetchData();
		} finally {
			Loading.close();
		}
	}

	renderContent(data: NFTAsset) {
		var {asset,selling} = data;
		var address = user.addressNoJump();
		return (
			<div className="details">
				
				<div className="left">
				{data.tokenURI.indexOf('.mp4') != -1 ?
					<video
						src={data.tokenURI} preload="auto" 
						autoPlay={true} loop={true} playsInline={true} webkit-playsinline="" 
						x5-playsinline="" style={{ width: '100%', height: '100%' }} 
					/>: <img className="collectible-detail-image" src={data.tokenURI} />}
				</div>

				<div className="right">
					<div className="txt1">{asset.name || data.tokenId}</div>
					
					<div className="txt2">{
						selling ? 
						<span>
							{util.price(selling.order.buyPrice)}（${util.priceDollar(selling.order.buyPrice)})
						</span>:
						<span>Unsold</span>
					}</div>
					<div className="line"></div>

					{/* <div className="txt3">持有人列表</div>
					<div className="txt4">
						<div>Allen.hou</div>
						<div>Jun marker</div>
					</div> */}
					{/* <div className="txt7">第01版 /共10版</div> */}

					<div className="txt5">
						<div>ARTIST ：<span>{asset.artist}</span></div>
						<div>OWNER ：<span>{asset.owner}</span></div>
					</div>
					{/* <div className="line"></div> */}
					
					{selling?
						<div>
							<div className="txt6">
								<div><span>Big Buyer：</span> {util.asAddress(selling.order.bigBuyer)}</div>
							</div>
							<div className="txt6">
								<div><span>Votes：</span>{util.price(selling.totalVotes)}</div>
							</div>
							<div className="txt6">
								<div><span>Min Sell Price：</span>{util.price(selling.order.minSellPrice)}</div>
							</div>
							<div className="txt6">
								<div><span>Max Sell Price：</span>{util.price(selling.order.maxSellPrice)}</div>
							</div>
							<div className="txt6">
								<div><span>Expiry：</span>{new Date(Number(selling.order.expiry) * 1e3).toString('yyyy-MM-dd hh:mm:ss')}</div>
							</div>
						</div>:
						<div className="txt6_no_data" />
					}

					<div className="box1">

						{data.selling /*&& asset.owner != address*/ ?
							<div className="btn" onClick={()=>this._buy(data)}>BUY</div>
							: null
						}

						{!data.selling && asset.owner == address ?
							<div className="btn" onClick={()=>this._sell(data)}>SELL</div>
							: null
						}

						{data.selling ?
							<div className="btn" onClick={()=>this._vote(data)}>VOTE</div>
						: null}

						{data.selling && asset.owner == address ?
							<div className="btn" onClick={()=>this._canEndSell(data)}>ENDSELL</div>
							: null
						}

					</div>
				</div>

			</div>
		);
	}

	render() {
		var data = this.state.data;

		return (
			<div>

				<Nav />

				{data?
					this.renderContent(data): 
					<div className="details">
						<div className="empty">Empty data</div>
					</div>
				}

				<Footer />

			</div>
		);
	}

}