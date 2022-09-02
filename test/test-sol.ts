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

import web3 from '../src/models/web3';
import somes from 'somes';
// import {rng} from 'somes/rng';
import {AssetStatus, exchange as ex, user} from '../src/models';
// import {contractAddress as Exchange} from '../src/models/eth/artifacts/Exchange';
// import {contractAddress as NFTs} from '../src/artifacts/NFTs';
import artifacts from '../src/models/web3/artifacts';
import nfts from '../src/models/web3/nfts';
// import * as user from '../src/models/user';

async function test() {
	console.log('ledger.balanceOf()', await artifacts.ledger.api.balanceOf('0x08A8b3135256725f25b44569D6Ef44674c16A237').call());
	console.log('ledger.transfer()', await artifacts.ledger.api.transfer('0x08A8b3135256725f25b44569D6Ef44674c16A237', BigInt('0')).call());
}

export async function newnft(hash_: string, uri_: string, name: string, toExchange: boolean) {
	// var hash = BigInt('0x' + rng(32).toString('hex'));
	// var hash = BigInt('0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246407');
	var hash = BigInt(hash_);
	var address = await user.address();
	var nfts = artifacts.nfts.api;

	var exists = await nfts.exists(hash).call();
	if (!exists) {
		await nfts.mint(hash).call();
		await nfts.mint(hash).post();
	}
	var uri = await nfts.tokenURI(hash).call();
	if (uri != uri_) {
		await nfts.setTokenURI(hash, uri_).call();
		await nfts.setTokenURI(hash, uri_).post();
		// 'https://ipfs.pixura.io/ipfs/QmSvZR32rfCDaKAPweFNa6ik8zoFkaGcMB5KYRNLgVMCwN/ultra-solem.mp4'
	}

	if (toExchange) {
		var owner = await nfts.ownerOf(hash).call();
		if (owner != ex.contractAddress) {
			var category = 0, flags = 0;
			var data = web3.eth.abi.encodeParameters(
				['uint16', 'uint16', 'string'], [category, flags, name]
			);
			await nfts.safeTransferFrom(address, ex.contractAddress, hash, data).call();
			await nfts.safeTransferFrom(address, ex.contractAddress, hash, data).post();
		}
	}

	console.log('gennft.tokenURI', await nfts.tokenURI(hash).call());
}

async function nft() {

	var tokens = [
		'0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246407',
		'0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246408',
		'0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246409',
		'0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae24640a',
		'0x3b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae24640b',
		'0x4b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246407',
		'0x4b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246408',
		'0x4b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae246409',
		'0x4b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae24640a',
		'0x4b8a95286812302a5e997d920524c3084c5dde131a2e9e18ee96722eae24640b',
	];
	var uri = 'https://ipfs.pixura.io/ipfs/QmSvZR32rfCDaKAPweFNa6ik8zoFkaGcMB5KYRNLgVMCwN/ultra-solem.mp4';

	for (var hash of tokens) {
		await newnft(hash, uri, 'nft_' + somes.random(), true);

		var tokenId = BigInt(hash);
		var asset = await artifacts.exchange.api.assetOf({token: nfts.contractAddress, tokenId }).call();
		if (asset.status == AssetStatus.List) { // sell
			var order = {
				token: nfts.contractAddress, tokenId,
				maxSellPrice: BigInt(1e19),
				minSellPrice: BigInt(1e18), lifespan: BigInt(1),
			};
			await artifacts.exchange.api.sell(order).call();
			await artifacts.exchange.api.sell(order).post();
		}
	}

	console.log('------------- nft ok -------------');

}

export default async function() {

	await test();
	await nft()

	var ex = artifacts.exchange.api;

	// console.log('exchange.ORDER_MAX_LIFESPAN', await ex.ORDER_MAX_LIFESPAN());
	// console.log('exchange.ORDER_MIN_LIFESPAN', await ex.ORDER_MIN_LIFESPAN());
	console.log('exchange.feePlan', await ex.feePlan().call());
	console.log('exchange.lastOrderId', await ex.lastOrderId().call());
	console.log('exchange.ledger', await ex.ledger().call());
	console.log('exchange.owner', await ex.owner().call());
	// console.log('exchange.renounceOwnership', await ex.renounceOwnership());
	// console.log('exchange.sellingOrders', await ex.sellingOrders(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529')));
	// console.log('exchange.transferOwnership', await ex.transferOwnership('0x08A8b3135256725f25b44569D6Ef44674c16A237')); // post
	console.log('exchange.votePool', await ex.votePool().call());
	// console.log('exchange.getSellOrder', await ex.getSellOrder(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529')));
	console.log('exchange.teamAddress', await ex.teamAddress().call());
	console.log('exchange.assetOf', await ex.assetOf({
		token: '0x08A8b3135256725f25b44569D6Ef44674c16A237', 
		tokenId: BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529'),
	}).call());
	console.log('exchange.getSellingNFT', await ex.getSellingNFT(BigInt(0), BigInt(10), false, true).call());
	console.log('exchange.getSellingNFTTotal', await ex.getSellingNFTTotal().call());

	var fee_plan = artifacts.fee_plan.api;

	console.log('fee_plan.feeToTeam', await fee_plan.feeToTeam().call());
	console.log('fee_plan.feeToTeamAtFirst', await fee_plan.feeToTeamAtFirst().call());
	console.log('fee_plan.feeToVoter', await fee_plan.feeToVoter().call());
	console.log('fee_plan.feeToVoterAtFirst', await fee_plan.feeToVoterAtFirst().call());
	console.log('fee_plan.owner', await fee_plan.owner().call());
	// console.log('fee_plan.renounceOwnership', await fee_plan.renounceOwnership());
	// console.log('fee_plan.transferOwnership', await fee_plan.transferOwnership());
	// console.log('fee_plan.initialize', await fee_plan.initialize('0x08A8b3135256725f25b44569D6Ef44674c16A237'));
	console.log('fee_plan.formula', await fee_plan.formula(BigInt('0x1ff00'), true, BigInt('0x100')).call());

	var ledger = artifacts.ledger.api;

	console.log('ledger.owner', await ledger.owner().call());
	// initialize(admin: Address): TransactionPromise;
	// renounceOwnership(): TransactionPromise;
	// transferOwnership(): TransactionPromise;
	console.log('ledger.decimals', await ledger.decimals().call());
	console.log('ledger.name', await ledger.name().call());
	console.log('ledger.symbol', await ledger.symbol().call());
	// addNewSubLedger(sub: Address): TransactionPromise;
	console.log('ledger.totalSupply', await ledger.totalSupply().call());
	console.log('ledger.balanceOf', await ledger.balanceOf('0x08A8b3135256725f25b44569D6Ef44674c16A237').call());
	// transfer(recipient: Address, amount: Uint256): TransactionPromise;
	console.log('ledger.allowance', await ledger.allowance('0x08A8b3135256725f25b44569D6Ef44674c16A237', '0x08A8b3135256725f25b44569D6Ef44674c16A237').call());
	// approve(spender: Address, amount: Uint256): TransactionPromise;
	// transferFrom(sender: Address, recipient: Address, amount: Uint256): TransactionPromise;
	// increaseAllowance(spender: Address, addedValue: Uint256): TransactionPromise;
	// decreaseAllowance(spender: Address, subtractedValue: Uint256): TransactionPromise;
	// burn(amount: Uint256): TransactionPromise;
	// mint(): TransactionPromise;
	// lock(to: Address, lockId: Uint256): TransactionPromise;
	// unlock(holder: Address, lockId: Uint256, withdrawNow: boolean): TransactionPromise;
	console.log('ledger.lockedItems', await ledger.lockedItems('0x08A8b3135256725f25b44569D6Ef44674c16A237').call());

	var vote_pool = artifacts.vote_pool.api;

	console.log('vote_pool.owner', await vote_pool.owner().call());
	// initialize(admin: Address): TransactionPromise;
	// renounceOwnership(): TransactionPromise;
	// transferOwnership(): TransactionPromise;
	console.log('vote_pool.MAX_PENDING_VOTES', await vote_pool.MAX_PENDING_VOTES().call());
	console.log('vote_pool.MAX_WEIGTH', await vote_pool.MAX_WEIGTH().call());
	console.log('vote_pool.MIN_WEIGTH', await vote_pool.MIN_WEIGTH().call());
	// console.log('vote_pool.VOTE_LOCKTIMES', await vote_pool.VOTE_LOCKTIMES());
	console.log('vote_pool.Voteing', await vote_pool.Voteing().call());
	console.log('vote_pool.exchange', await vote_pool.exchange().call());
	console.log('vote_pool.lastVoteId', await vote_pool.lastVoteId().call());
	console.log('vote_pool.ledger', await vote_pool.ledger().call());
	console.log('vote_pool.ordersById', await vote_pool.ordersById(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529')).call());
	console.log('vote_pool.votesById', await vote_pool.votesById(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529')).call());
	// votesByVoter(account: Address, _: Uint256): Promise<Uint256[]>;
	// init(exchange_: Address, ledger_: Address): TransactionPromise;
	// marginVote(orderId: Uint256): TransactionPromise;
	// cancelVote(voteId: Uint256): TransactionPromise;
	// subCommission(orderId: Uint256): TransactionPromise;
	// settle(holder: Address): TransactionPromise;
	console.log('vote_pool.orderTotalVotes', await vote_pool.orderTotalVotes(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529')).call());
	console.log('vote_pool.canRelease', await vote_pool.canRelease('0x08A8b3135256725f25b44569D6Ef44674c16A237').call());
	// tryRelease(holder: Address): TransactionPromise;
	console.log('vote_pool.unlockAllowed', await vote_pool.unlockAllowed(BigInt('0x0c3b14b48efe80524918e366821b49a30905c6e7187f6a5a717843f28653a529'), '0x08A8b3135256725f25b44569D6Ef44674c16A237').call());
	console.log('vote_pool.allVotes', await vote_pool.allVotes('0x08A8b3135256725f25b44569D6Ef44674c16A237').call());

}
