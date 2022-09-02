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

import somes from 'somes';
import web3 from '../src/models/web3';
import request from 'somes/request';
import nfts from '../src/models/web3/nfts';

export async function sign(primaryType:any,domain:any,types: any, parameters: any) {
	var mask = web3.metaMask;
	var [from] = await mask.request({ method: 'eth_requestAccounts' });

	var signature = await mask.request({
		method: 'eth_signTypedData_v4',
		params: [
			from,
			JSON.stringify({
				"primaryType": primaryType,
				"domain": domain,
				"types": types,
				"message": parameters
			})
		],
	});

	console.log(signature);

	return {parameters, signature: signature};
}

export async function send() {

	let now = Math.floor(Date.now() / 1e3);

	let params = {
		"offerer": "0x45d9dB730bac2A2515f107A3c75295E3504faFF7",
		"zone": "0x00000000E88FE2628EbC5DA81d2b3CeaD633E89e",
		"zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
		"startTime": String(now),
		"endTime": String(now + 2600*24*30),
		"orderType": 3,
		"offer": [
			{
				"itemType": 3,
				"token": "0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656",
				"identifierOrCriteria": "79686119660027041278189397831443838576703631296106326292177666637010539905025",
				// "itemType": 2,
				// "token": "0x7200CC8180DE111306D8A99E254381080dA48Fd7",
				// "identifierOrCriteria": "1",
				"startAmount": "1",
				"endAmount": "1"
			}
		],
		"consideration": [
			{
					"itemType": 0,
					"token": "0x0000000000000000000000000000000000000000",
					"identifierOrCriteria": "0",
					"startAmount": "9750000000000000",
					"endAmount": "9750000000000000",
					"recipient": "0x45d9dB730bac2A2515f107A3c75295E3504faFF7"
			},
			{
				"itemType": 0,
				"token": "0x0000000000000000000000000000000000000000",
				"identifierOrCriteria": "0",
				"startAmount": "250000000000000",
				"endAmount": "250000000000000",
				"recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
			}
		],
		"totalOriginalConsiderationItems": "2",
		"salt": "36980727087255389",
		"conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
		"counter": 0
	};

	let types = {
		"EIP712Domain": [
			{
				"name": "name",
				"type": "string"
			},
			{
				"name": "version",
				"type": "string"
			},
			{
				"name": "chainId",
				"type": "uint256"
			},
			{
				"name": "verifyingContract",
				"type": "address"
			}
		],
		"OrderComponents": [
			{
				"name": "offerer",
				"type": "address"
			},
			{
				"name": "zone",
				"type": "address"
			},
			{
				"name": "offer",
				"type": "OfferItem[]"
			},
			{
				"name": "consideration",
				"type": "ConsiderationItem[]"
			},
			{
				"name": "orderType",
				"type": "uint8"
			},
			{
				"name": "startTime",
				"type": "uint256"
			},
			{
				"name": "endTime",
				"type": "uint256"
			},
			{
				"name": "zoneHash",
				"type": "bytes32"
			},
			{
				"name": "salt",
				"type": "uint256"
			},
			{
				"name": "conduitKey",
				"type": "bytes32"
			},
			{
				"name": "counter",
				"type": "uint256"
			}
		],
		"OfferItem": [
				{
						"name": "itemType",
						"type": "uint8"
				},
				{
						"name": "token",
						"type": "address"
				},
				{
						"name": "identifierOrCriteria",
						"type": "uint256"
				},
				{
						"name": "startAmount",
						"type": "uint256"
				},
				{
						"name": "endAmount",
						"type": "uint256"
				}
		],
		"ConsiderationItem": [
				{
						"name": "itemType",
						"type": "uint8"
				},
				{
						"name": "token",
						"type": "address"
				},
				{
						"name": "identifierOrCriteria",
						"type": "uint256"
				},
				{
						"name": "startAmount",
						"type": "uint256"
				},
				{
						"name": "endAmount",
						"type": "uint256"
				},
				{
						"name": "recipient",
						"type": "address"
				}
		]
	};

	let {signature, parameters} = await sign('OrderComponents', {
			chainId: "4",
			name: "Seaport",
			verifyingContract: "0x00000000006c3852cbEf3e08E8dF289169EdE581",
			version: "1.1"
	}, types, params);

	let {statusCode, data} = await request.post('https://testnets-api.opensea.io/v2/orders/rinkeby/seaport/listings', {
		params: {
			parameters,
			signature,
		},
		headers: {
			'X-API-KEY': '2f6f419a083c46de9d83ce3dbe7db601',
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	});

	console.log('statusCode', statusCode);
	console.log('data', JSON.parse(data.toString('utf-8')));
}

export  async function send2() {debugger
	let chain = 4;

	let token = '0x9D4C8Ee703BC7B7F269C8128487d1bB4ffD29454';
	let tokenId = '57481108764297047532514676150636851709750899247555159851122876731761713921785';
	// let tokenId = '0xb66f5506df99198f8b23ac37bda6818199cedc680899d778e573179bbcea3c6e';
	//
	// let token = '0x12073c130ee0612219a0b54e56582ce24155dfa8';
	// let tokenId = '2202';
	// let tokenId = '1';

	let { data: orderJson } = await request.post('http://127.0.0.1:8002/service-api/opensea/getOrderParameters', {
		params: { chain: chain, token, tokenId, amount: 1e18.toString() },
	});

	let { data: {primaryType,domain,types, value, isApprovedForAll,OPENSEA_CONDUIT_ADDRESS} } = JSON.parse(orderJson.toString());

	if (! isApprovedForAll ) {
		await nfts.setApprovalForAll(token, OPENSEA_CONDUIT_ADDRESS, true);
	}
	
	let {signature, parameters} = await sign(primaryType,domain,types, value);

	let { data: orderJson2 } = await request.post('http://127.0.0.1:8002/service-api/opensea/createOrder', {
		params: { chain: chain, order: parameters, signature },
	});

	let {data, errno,message} = JSON.parse(orderJson2.toString());

	somes.assert(!errno, message);

	console.log('statusCode, data', data);
}

export default function () {
	return send2();
}