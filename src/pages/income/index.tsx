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

import {Page,React,Link} from 'webpkit';
import Nav from '../../com/nav';
import Footer from '../../com/footer';
import {vote_pool as vp, exchange as ex, SellStore,OrderStatus,Vote, user, ledger} from '../../models';
import * as util from '../../util';
import './index.scss';
import Loading from '../../com/loading';
import Dialog from '../../com/dialog';

export default class extends Page {

	state = { 
		balanceOf: BigInt(0),
		canRelease: BigInt(0),
		lockedItems: [] as {
			locker: string;
			lockId: bigint;
			amount: bigint;
		}[],
		votes: [] as Vote[],
		orders: [] as SellStore[],
		status: [] as OrderStatus[],
	};

	async triggerLoad() {
		await this._fetchData();
	}

	async _fetchData() {
		var address = user.addressNoJump();
		var balanceOf = await ledger.balanceOf(address);
		var canRelease = await vp.canRelease(address);
		var lockedItems = await ledger.lockedItems(address);

		console.log('canRelease', canRelease);

		console.log('ledger.balanceOf(artifacts.vote_pool.address)', util.price(await ledger.balanceOf(vp.contractAddress)));

		// console.log('vp.ordersById', await vp.ordersById(BigInt(21)));

		var votes = [];
		var orders = [];
		var status = [];

		for (var i of lockedItems) {
			var vote = await vp.votesById(i.lockId);
			var order = await ex.bids(vote.orderId);
			var state = await ex.orderStatus(vote.orderId);
			votes.push(vote);
			orders.push(order);
			status.push(state);
		}

		// console.log(balanceOf, canRelease, lockedItems);
		this.setState({ balanceOf, canRelease, lockedItems, votes, orders, status });
	}

	async _Withdraw() {
		var address = user.addressNoJump();
		try {
			var { amount, ok } = await new Promise((r)=>{
				Dialog.prompt({ text: 'Input amount' }, (amount, ok)=>r({amount, ok}));
			});
			if (!ok) return;
			await Loading.show();
			await ledger.withdraw(address, BigInt(amount) * BigInt(1e18));
			Dialog.alert('Withdraw OK', ()=>this._fetchData());
		} finally {
			Loading.close();
		}
	}

	async _CancelVote(voteId: bigint) {
		try {
			await Loading.show();
			await vp.cancelVote(voteId);
			Dialog.alert('Cancel Vote OK', ()=>this._fetchData());
		} finally {
			Loading.close();
		}
	}

	async _tryRelease() {
		var address = user.addressNoJump();
		await vp.tryRelease(address);
	}

	render() {
		var {balanceOf,lockedItems, orders, votes, status, canRelease } = this.state;
		return (
			<div>

				<Nav />

				<div className="page_title">NFT101</div>

				<div className="income">

					<div className="balance-of">
						<h3>BalanceOf({util.price(balanceOf - canRelease)}) + Vote income({util.price(canRelease)}) = {util.price(balanceOf)} </h3>
						<button onClick={()=>this._Withdraw()}>Withdraw</button>
					</div>

					<div className="balance-of">
						{/* <button onClick={()=>this._tryRelease()}>tryRelease</button> */}
					</div>

					<div className="votes">Vote locks:</div>
					<div className="list">
					{
						lockedItems.map((e,j)=>{
							var order = orders[j];
							var vote = votes[j];
							var stat = status[j];
							return (
								<div className="list_item" key={j}>
									<div className="txt">
										<div>lockId: {String(e.lockId)}</div>
										<div>voteId: {String(e.lockId)}</div>
										<div>amount: {util.price(e.amount)}</div>
										<div>orderId: {String(vote.orderId)}</div>
										<div>token: {String(order.token)}</div>
										<div>tokenId: {'0x' + order.tokenId.toString(16)}</div>
									</div>
									<Link to={`/details?token=${String(order.token)}&tokenId=${String(order.tokenId)}`}>Go</Link>
									{stat == OrderStatus.DealDone ? null: <button onClick={()=>this._CancelVote(e.lockId)}>Cancel</button>}
								</div>
							);
						})
					}
					</div>

				</div>

				<Footer />

			</div>
		);
	}

}