
import {check} from '../src/models/web3/artifacts';
import test_sol from './test-sol';
import test_mod from './test-mod';
import * as cfg from '../config';
import {encodeParameters} from '../src/models';
import opensea from './test-opensea';

async function test() {

	opensea();

	var str = encodeParameters(['address', 'uint256'], ['0x45d9dB730bac2A2515f107A3c75295E3504faFF7', 1]);

	console.log(str);

	if (cfg.platform == 'eth') {
		// await test_sol();
		// await test_mod();
		// await check();
	} else {
		// await test_substrate();
		// await test_substrate2();
	}

}

test();

export {}