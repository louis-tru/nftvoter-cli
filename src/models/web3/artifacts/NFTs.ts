/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {Address,Uint256,Bytes} from 'web3-tx/solidity_types';
import {Result} from 'web3-tx/happy';
import * as json from './NFTs.json';
import {contracts} from '../../../../config';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = contracts.nfts;// '0x7322ee767aaD2dEf9e3527Dc1230fB5f09ead682';

export default interface NFTs {
	balanceOf(owner: Address): Result<Uint256>;
	ownerOf(tokenId: Uint256): Result<Address>;
	name(): Result<string>;
	symbol(): Result<string>;
	tokenURI(tokenId: Uint256): Result<string>;
	baseURI(): Result<string>;
	tokenOfOwnerByIndex(owner: Address, index: Uint256): Result<Uint256>;
	totalSupply(): Result<Uint256>
	tokenByIndex(index: Uint256): Result<Uint256>;
	approve(to: Address, tokenId: Uint256): Result<void>
	getApproved(tokenId: Uint256): Result<Address>;
	setApprovalForAll(operator: Address, approved: boolean): Result<void>;
	isApprovedForAll(owner: Address, operator: Address): Result<boolean>;
	transferFrom(from: Address, to: Address, tokenId: Uint256): Result<void>;
	safeTransferFrom(from: Address, to: Address, tokenId: Uint256, data: Bytes): Result<void>;
	mint(tokenId: Uint256): Result<void>;
	safeMintURI(to: Address, tokenId: Uint256, tokenURI: string, data: Bytes): Result<void>;
	safeMint(to: Address, tokenId: Uint256, data: Bytes): Result<void>;
	burn(tokenId: Uint256): Result<void>;
	setTokenURI(tokenId: Uint256, tokenURI: string): Result<void>;
	setBaseURI(baseURI: string): Result<void>;
	exists(tokenId: Uint256): Result<boolean>;
	isApprovedOrOwner(spender: Address, tokenId: Uint256): Result<boolean>;
}