
import {Address} from 'web3-tx/solidity_types';
import * as cfg from '../config';

export function isEmptyAddress(address: Address) {
	return address == '0x0000000000000000000000000000000000000000';
}

export function asAddress(address?: Address, defaultValue?: string) {
	if (address && !isEmptyAddress(address)) {
		return address as string;
	} else {
		return defaultValue || 'None';
	}
}

export function ethRateDollar() {
	return Number(cfg.exchange_rate) || 10;
}

export function price(eth?: bigint) {
	if (eth) {
		return (Number(eth) / 1e18).toFixed(2);
	}
	return '0.0';
}

export function priceDollar(eth?: bigint) {
	if (eth) {
		return ((Number(eth) / 1e18) * ethRateDollar()).toFixed(1);
	}
	return '0.0';
}