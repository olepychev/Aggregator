export const defillamaReferrerAddress = '0x08a3c2A819E3de7ACa384c798269B3Ce1CD0e437';

export const chainsMap = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	gnosis: 100,
	fantom: 250,
	klaytn: 8217,
	aurora: 1313161554,
	celo: 42220,
	cronos: 25,
	dogechain: 2000,
	moonriver: 1285,
	bttc: 199,
	oasis: 42262,
	velas: 106,
	heco: 128,
	harmony: 1666600000,
	boba: 288,
	okexchain: 66,
	fuse: 122,
	moonbeam: 1284,
	canto: 7700,
} as const;

export const geckoChainsMap: Record<string, typeof chainsMap[keyof typeof chainsMap]> = {
	ethereum: 1,
	'binance-smart-chain': 56,
	'polygon-pos': 137,
	'optimistic-ethereum': 10,
	'arbitrum-one': 42161,
	avalanche: 43114,
	xdai: 100,
	fantom: 250,
	'klay-token': 8217,
	aurora: 1313161554,
	celo: 42220,
	cronos: 25,
	dogechain: 2000,
	moonriver: 1285,
	bittorrent: 199,
	oasis: 42262,
	velas: 106,
	heco: 128,
	'harmony-shard-0': 1666600000,
	boba: 288,
	'okex-chain': 66,
	fuse: 122,
	moonbeam: 1284,
	canto: 7700,
};

export const chainGasToken: Record<keyof typeof chainsMap, string> = {
	ethereum: 'ethereum',
	bsc: 'binancecoin',
	polygon: 'matic-network',
	optimism: 'ethereum',
	arbitrum: 'ethereum',
	avax: 'avalanche-2',
	gnosis: 'xdai',
	fantom: 'fantom',
	klaytn: 'klay-token',
	aurora: 'ethereum',
	celo: 'celo',
	cronos: 'crypto-com-chain',
	dogechain: 'dogecoin',
	moonriver: 'moonriver',
	bttc: 'bittorrent',
	oasis: 'oasis-network',
	velas: 'velas',
	heco: 'huobi-token',
	harmony: 'harmony',
	boba: 'ethereum',
	okexchain: 'oec-token',
	fuse: 'fuse-network-token',
	moonbeam: 'moonbeam',
	canto: 'canto',
};

export const llamaToGeckoChainsMap = Object.fromEntries(
	Object.entries(chainsMap)
		.map(([lllamaChainName, chainId]) => {
			const gchain = Object.entries(geckoChainsMap).find((geckoChain) => chainId === geckoChain[1]);

			if (gchain) {
				return [lllamaChainName, gchain[0]];
			}
			return null;
		})
		.filter((c) => c !== null)
);

export const dexToolsChainMap: Record<typeof chainsMap[keyof typeof chainsMap], string> = {
	1: 'ether',
	56: 'bsc',
	137: 'polygon',
	10: 'optimism',
	42161: 'arbitrum',
	43114: 'avalanche',
	100: 'gnosis',
	250: 'fantom',
	1313161554: 'aurora',
	42220: 'celo',
	25: 'cronos',
	2000: 'dogechain',
	1285: 'moonriver',
	42262: 'oasis',
	106: 'velas',
	128: 'heco',
	1666600000: 'harmony',
	288: 'boba',
	66: 'okc',
	122: 'fuse',
	1284: 'moonbeam',
	199: 'bittorrent',
	8217: 'klay',
	7700: 'canto',
};

export const chainIdToName = (chainId) => {
	return Object.entries(chainsMap).find(([, id]) => String(id) === String(chainId))?.[0];
};

export const chainNamesReplaced = {
	bsc: 'BSC',
	avax: 'Avalanche',
	okexchain: 'OKX',
	bttc: 'BitTorrent'
};

export const nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

export const initialLiquidity = [500, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 500_000_000];

export const PRICE_IMPACT_WARNING_THRESHOLD = 7;


export const initialTokens = [{
  "name": "ChainLink Token",
  "address": "0x514910771af9ca656af840dff83e8264ecf986ca",
  "symbol": "LINK",
  "decimals": 18,
  "chainId": 1,
  "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png",
  "extensions": {
      "bridgeInfo": {
          "10": {
              "tokenAddress": "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6"
          },
          "56": {
              "tokenAddress": "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"
          },
          "137": {
              "tokenAddress": "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39"
          },
          "42161": {
              "tokenAddress": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"
          }
      }
  },
  "label": "LINK",
  "value": "0x514910771af9ca656af840dff83e8264ecf986ca",
  "geckoId": null,
  "volume24h": 0
},
{
  "name": "Uniswap",
  "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "symbol": "UNI",
  "decimals": 18,
  "chainId": 1,
  "logoURI": "ipfs://QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg",
  "extensions": {
      "bridgeInfo": {
          "10": {
              "tokenAddress": "0x6fd9d7AD17242c41f7131d257212c54A0e816691"
          },
          "56": {
              "tokenAddress": "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1"
          },
          "137": {
              "tokenAddress": "0xb33EaAd8d922B1083446DC23f610c2567fB5180f"
          },
          "42161": {
              "tokenAddress": "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0"
          }
      }
  },
  "label": "UNI",
  "value": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "geckoId": null,
  "volume24h": 0
},
{
  "symbol": "ETH",
  "name": "Ether",
  "decimals": 18,
  "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "logoURI": "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
  "tags": [
      "native",
      "PEG:ETH"
  ],
  "chainId": 1,
  "label": "ETH",
  "value": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "geckoId": null,
  "volume24h": 0
},
{
  "name": "BTC",
  "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "symbol": "BTC",
  "decimals": 8,
  "chainId": 1,
  "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  "extensions": {
      "bridgeInfo": {
          "10": {
              "tokenAddress": "0x68f180fcCe6836688e9084f035309E29Bf0A2095"
          },
          "137": {
              "tokenAddress": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
          },
          "42161": {
              "tokenAddress": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
          }
      }
  },
  "label": "BTC",
  "value": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "geckoId": null,
  "volume24h": 11952137.412008408
}]
