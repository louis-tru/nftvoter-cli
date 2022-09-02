
module.exports = {
	sdk: 'http://127.0.0.01:8091/service-api',
	prefixer: 'http://hash-release.stars-mine.com/v2',
	substrate: 'ws://127.0.0.1:9944',
	exchange_rate: 10,
	platform: 'eth', // substrate | eth
	contracts: {
		exchange: '0x9047212993be16d68934c7F2B5544a51E96a5D0F',
		ledger: '0xBc31Eda8a2A70eA482C0e960473e6D1BeA50a0cC',
		votePool: '0x2342D21747Bc601D83b4d94e4ACFBfB9293E1e30',
		feePlan: '0xfcAADCfaD1A256C2125C811A33D4f92140f94E3A',
		nfts: '0x5EAd04cc3eCeF38294E2CF675C4C889cBb739207',
	},
}