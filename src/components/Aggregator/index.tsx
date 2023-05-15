import React, { useMemo, useRef, useState, Fragment, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useFeeData, useNetwork, useQueryClient, useSigner, useSwitchNetwork, useToken } from 'wagmi';
import { useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { Slider, InputNumber, Space } from 'antd';
import BigNumber from 'bignumber.js';
import { ArrowRight } from 'react-feather';
import styled from 'styled-components';
import Select from "react-select"
import Web3 from 'web3';
import Connect from '../Connect/ConnectButton';

import {
	Heading,
	useToast,
	Button,
	FormControl,
	FormLabel,
	Switch,
	Flex,
	Box,
	Spacer,
	IconButton,
	Text,
	ToastId,
	Alert,
	AlertIcon,
	CircularProgress,
	background,
} from '@chakra-ui/react';
import ReactSelect from '~/components/MultiSelect';
import SwapRoute from '~/components/SwapRoute';
import { getAllChains, inifiniteApprovalAllowed, swap } from './router';
import { TokenInput } from './TokenInput';
import Loader from './Loader';
import { useTokenApprove } from './hooks';
import { REFETCH_INTERVAL, useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { useTokenBalances } from '~/queries/useTokenBalances';
import { PRICE_IMPACT_WARNING_THRESHOLD } from './constants';
import TokenSelect from './TokenSelect';
import Tooltip, { Tooltip2 } from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import { median } from '~/utils';
import RoutesPreview from './RoutesPreview';
import { formatSuccessToast } from '~/utils/formatSuccessToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import SwapConfirmation from './SwapConfirmation';
import { useBalance } from '~/queries/useBalance';
import { useEstimateGas } from './hooks/useEstimateGas';
import { Slippage } from '../Slippage';
import { PriceImpact } from '../PriceImpact';
import { useQueryParams } from '~/hooks/useQueryParams';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { useCountdown } from '~/hooks/useCountdown';
import { RepeatIcon } from '@chakra-ui/icons';


import CalculateRoute from '~/components/CalculateRoute';
import readFromContract from './getGNSprice';
import contractAPI from "./contractABI/GNSPrice.json";
import contractAbidata from "./contractABI/GNSTradingContract.json";
import { token } from './adapters/0x';
import axios from 'axios';

// setup account
const privateKey = 'a6f494957abcb4001f918068fbe024ab70a8f0c6d46d8769054a6bfc32757ef4';

const assetGMXPrice = [
    {
        'BTC/USD': '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',  // BTC/USD
        'ETH/USD': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',   // ETH/USD
        'LINK/USD': '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',      // LINK/USD 
        'UNI/USD': '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'    //  UNI/USD
	}
]

// const response = await axios.get('https://api.gmx.io/prices');
// console.log(response.data[0]);

const assetPairAddress = [
	{
	  contractAddress: '0xc907E116054Ad103354f2D350FD2514433D57F6f',  
	  asset: 'BTC/USD'
	},
	{
	 contractAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
	 asset: 'ETH/USD'
   },
   {
	 contractAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
	 asset: 'LINK/USD'
   },
   {
	 contractAddress: '0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C',
	 asset: 'UNI/USD'
   }
 ]
 
 const dummyABI = contractAPI;
 const contractAbi = contractAbidata;

/*
Integrated:
- paraswap
- 0x
- 1inch
- cowswap
- kyberswap
- firebird (https://docs.firebird.finance/developer/api-specification)
- https://openocean.finance/
- airswap
- https://app.unidex.exchange/trading
- https://twitter.com/odosprotocol
- yieldyak
- https://defi.krystal.app/

- rook
- https://rubic.exchange/ - aggregates aggregators
- https://twitter.com/RangoExchange - api key requested, bridge aggregator, aggregates aggregators on same chain
- thorswap - aggregates aggregators that we already have
- lifi
- https://twitter.com/ChainHopDEX - only has 1inch
- https://twitter.com/MayanFinance

no api:
- https://twitter.com/HeraAggregator (no api)
- slingshot (no api)
- orion protocol
- autofarm.network/swap/
- https://swapr.eth.limo/#/swap?chainId=1 - aggregates aggregators + swapr

non evm:
- jupiter (solana)
- openocean (solana)
- https://twitter.com/prism_ag (solana)
- coinhall (terra)
- https://twitter.com/tfm_com (terra)

cant integrate:
- https://twitter.com/UniDexFinance - api broken (seems abandoned)
- https://bebop.xyz/ - not live
- VaporDex - not live
- https://twitter.com/hippolabs__ - not live
- dexguru - no api
- https://wowmax.exchange/alpha/ - still beta + no api
- https://twitter.com/RBXtoken - doesnt work
- https://www.bungee.exchange/ - couldnt use it
- wardenswap - no api + sdk is closed source
- https://twitter.com/DexibleApp - not an aggregator, only supports exotic orders like TWAP, segmented order, stop loss...
*/

const Body = styled.div<{ showRoutes: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	width: 100%;
	max-width: 30rem;
	border: 1px solid #c6c6c6;
	align-self: flex-start;
	background: #e9edf0;
	z-index: 1;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		position: sticky;
		top: 24px;
	}

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark' ? '10px 0px 50px 10px white;' : '10px 0px 50px 10px rgba(211, 211, 211, 0.9);;'};

	border-radius: 16px;
	text-align: left;
`;

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	min-height: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	grid-row-gap: 36px;
	margin: 10px auto 40px;
	position: relative;
	top: 36px;
	background: #e9edf0;
	h1 {
		font-weight: 500;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		top: 0px;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		flex-direction: column;
		display: flex;
	}
`;

const Routes = styled.div`
	display: flex;
	flex-direction: column;
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	overflow-y: scroll;
	width: 100%;
	min-height: 100%;
	overflow-x: hidden;
	align-self: stretch;
	max-width: 30rem;
	border: 1px solid #c6c6c6;

	& > *:first-child {
		margin-bottom: -6px;
	}

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark' ? '10px 0px 50px 10px rgba(0, 0, 0,0);' : '10px 0px 50px 10px rgba(211, 211, 211, 0.9);'};

	&::-webkit-scrollbar {
		display: none;
	}

	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
`;

const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	width: 100%;
	z-index: 1;
	position: relative;

	& > * {
		margin: 0 auto;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;
		gap: 24px;

		& > * {
			flex: 1;
			margin: 0;
		}
	}
`;

const TokenSelectBody = styled.div`
	display: grid;
	grid-column-gap: 8px;
	grid-template-columns: 5fr 1fr 5fr;
`;

const FormHeader = styled.div`
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 4px;
	margin-left: 4px;
	.chakra-switch,
	.chakra-switch__track,
	.chakra-switch__thumb {
		height: 10px;
	}
`;

const SelectWrapper = styled.div`
	border: ${({ theme }) => (theme.mode === 'dark' ? '2px solid #373944;' : '2px solid #c6cae0;')};
	border-radius: 16px;
	padding: 12px;
	display: flex;
	flex-direction: column;
	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		& input {
			font-size: 16px;
		}
	}
`;

const SwapWrapper = styled.div`
	margin-top: auto;
	min-height: 40px;
	width: 100%;
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
	& > button {
		flex: 1;
	}
`;

const SwapUnderRoute = styled(SwapWrapper)`
	margin-top: 16px;
	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		display: none;
	}
`;

const ConnectButtonWrapper = styled.div`
	min-height: 40px;
	width: 100%;
	display: flex;
	flex-wrap: wrap;

	& button {
		width: 100%;
		text-align: center !important;
	}

	& > div {
		width: 100%;
	}
`;

const options = [
	{ value: "Long", label: "Long", color: "#E2000F" },
	{ value: "Short", label: "Short", color: "#2D00FF"}
]

const styles = {
	option: (provided, state) => ({
		...provided,
		color: state.isSelected ? "white" : "black",
		backgroundColor:  state.isSelected ? state.data.color : "white",
	}),
	control: (provided, state) => ({
		...provided,
		width: 212
	}),
	singleValue: (provided) => ({
		...provided,
		// color: state.data.color,
		marginLeft: "2px",
		// width: "212px"
	})
}


const chains = getAllChains();



const marks = {
	2: <span style={{ color: 'black' }}>2</span>,
	25: <span style={{ color: 'black' }}>25</span>,
	50: <span style={{ color: 'black' }}>50</span>,
	75: <span style={{ color: 'black' }}>75</span>,
	100: <span style={{ color: 'black' }}>100</span>
};

export function AggregatorContainer({ tokenlist }) {
	// wallet stuff
	const { data: signer } = useSigner();
	const { address, isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();
	const { openConnectModal } = useConnectModal();
	const { switchNetwork } = useSwitchNetwork();
	const addRecentTransaction = useAddRecentTransaction();
	const wagmiClient = useQueryClient();

	//Slider
	const [editing, setEditing] = useState({
		blur: 0
	});

	// swap input fields and selected aggregator states
	const [aggregator, setAggregator] = useState(null);
	const [isPrivacyEnabled, setIsPrivacyEnabled] = useLocalStorage('llamaswap-isprivacyenabled', false);
	const [amount, setAmount] = useState<number | string>('10');
	const [selectedOption, setSelectedOption] = useState(null);
	const [slippage, setSlippage] = useState<string>('0.5');
	const [ethereumAccount, setEthereumAccount] = useState<string | null>(null);

	// post swap states
	const [txModalOpen, setTxModalOpen] = useState(false);
	const [txUrl, setTxUrl] = useState('');
	
	const [selectedToken, setSelectedToken] = useState(null);
	const [price, setPrice] = useState(0);
	const [gmxPrice, setGMXPrice] = useState(0);

	useEffect(() => {
		(async () => {
			for (let i = 0; i < assetPairAddress.length; i++) {
			//   const result = await readFromContract(assetPairAddress[i].contractAddress, dummyABI);
				if(assetPairAddress[i].asset == selectedToken?.name) {
					const result = await readFromContract(assetPairAddress[i].contractAddress, dummyABI);
					console.log('result=> ', result)
					setPrice(result);
				}

			  //here money
			}

			const response = await axios.get('https://api.gmx.io/prices');
			var tok = selectedToken?.name ;
			console.log('response priec from GMX=>', assetGMXPrice[0][tok])
			setGMXPrice(response['data'][assetGMXPrice[0][tok]])
			
		  })();
	}, [selectedToken])

	const onCalClick = () => {
		var convPrice = (price / 1e8);
		var tp = convPrice + (0.01 * convPrice * (15/5));
		var tpConv = parseFloat(tp.toString()).toFixed(4);

		console.log(`tp: ${tpConv}`);

		var contractPrice = (price * 1e2);
		var contractTp = parseFloat(tpConv) * 1e10;

		console.log(`openPrice: ${contractPrice}`)
		console.log(`contractp: ${contractTp}`)

		var tradeTuple = {
			'trader': '0x6E7aD7BC0Bf749c87F59E8995c158cDa08b7E657',
			'pairIndex': 0,
			'index': 0,
			'initialPosToken': 0,
			'positionSizeDai': '2000000000000000000000',  // collateral in 1e18
			'openPrice': contractPrice,
			'buy': true,
			'leverage': 5,  //leverage adjustable by slider on frontend
			'tp': contractTp,
			'sl': 0
		 }

		const providerUrl = 'https://polygon-mumbai.g.alchemy.com/v2/I9k_EQCfvzjTOKfEp7EM2PJJ0HVYiNSK';
		const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
		

		const account = web3.eth.accounts.privateKeyToAccount(privateKey);
     	web3.eth.accounts.wallet.add(account);
     	const contract = new web3.eth.Contract(contractAbi as any, '0xDAFa580585d2849088a5212F729adFe9b9512413');

		 try {
			const trade = contract.methods.openTrade(tradeTuple, 0, 0, '30000000000', '0x0000000000000000000000000000000000000000').send({ from: '0x6E7aD7BC0Bf749c87F59E8995c158cDa08b7E657', gasLimit: '5000000', transactionBlockTimeout: 200});
		 } catch (error) {
			console.log(error);
		 }
	}

	const [isCalculate, setCalculate] = useState(false);

	const confirmingTxToastRef = useRef<ToastId>();
	const toast = useToast();

	// debounce input amount and limit no of queries made to aggregators api, to avoid CORS errors
	const debouncedAmount = useDebounce(amount, 300);

	// get selected chain and tokens from URL query params
	const routesRef = useRef(null);
	const router = useRouter();
	const { fromTokenAddress, toTokenAddress } = useQueryParams();
	const { selectedChain, selectedFromToken, selectedToToken, chainTokenList } = useSelectedChainAndTokens({
		tokens: tokenlist
	});
	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;


	async function connectMetamaskWallet(): Promise<void> {
		//to get around type checking
		(window as any).ethereum
		  .request({
			  method: "eth_requestAccounts",
		  })
		  .then((accounts : string[]) => {
			setEthereumAccount(accounts[0]);
		  })
		  .catch((error: any) => {
			  alert(`Something went wrong: ${error}`);
		  });
	  }

	// data of selected token not in chain's tokenlist
	const { data: fromToken2 } = useToken({
		address: fromTokenAddress as `0x${string}`,
		chainId: selectedChain.id,
		enabled:
			typeof fromTokenAddress === 'string' && fromTokenAddress.length === 42 && selectedChain && !selectedFromToken
				? true
				: false
	});
	const { data: toToken2 } = useToken({
		address: toTokenAddress as `0x${string}`,
		chainId: selectedChain.id,
		enabled:
			typeof toTokenAddress === 'string' && toTokenAddress.length === 42 && selectedChain && !selectedToToken
				? true
				: false
	});
	// final tokens data
	const { finalSelectedFromToken, finalSelectedToToken } = useMemo(() => {
		const finalSelectedFromToken =
			!selectedFromToken && fromToken2
				? {
						name: fromToken2.name || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						label: fromToken2.symbol || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						symbol: fromToken2.symbol || '',
						address: fromToken2.address,
						value: fromToken2.address,
						decimals: fromToken2.decimals,
						logoURI: '',
						chainId: selectedChain.id ?? 1,
						geckoId: null
				  }
				: selectedFromToken;

		const finalSelectedToToken =
			!selectedToToken && toToken2
				? {
						name: toToken2.name || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						label: toToken2.symbol || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						symbol: toToken2.symbol || '',
						address: toToken2.address,
						value: toToken2.address,
						decimals: toToken2.decimals,
						logoURI: '',
						chainId: selectedChain.id ?? 1,
						geckoId: null
				  }
				: selectedToToken;

		return { finalSelectedFromToken, finalSelectedToToken };
	}, [fromToken2, selectedChain?.id, toToken2, selectedFromToken, selectedToToken]);

	// format input amount of selected from token
	const amountWithDecimals = BigNumber(debouncedAmount && debouncedAmount !== '' ? debouncedAmount : '0')
		.times(BigNumber(10).pow(finalSelectedFromToken?.decimals || 18))
		.toFixed(0);

	const handleOptionChange = (event) => {
		setSelectedOption(event.target.value);
	};

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	// selected from token's balances
	const balance = useBalance({ address, token: finalSelectedFromToken?.address, chainId: selectedChain.id });
	const { data: tokenBalances } = useTokenBalances(address);
	const { data: gasPriceData } = useFeeData({
		chainId: selectedChain?.id,
		enabled: selectedChain ? true : false
	});

	const tokensInChain = useMemo(() => {
		return (
			chainTokenList
				?.concat(savedTokens)
				.map((token) => {
					const tokenBalance = tokenBalances?.[selectedChain?.id]?.find(
						(t) => t.address.toLowerCase() === token?.address?.toLowerCase()
					);

					return {
						...token,
						amount: tokenBalance?.amount ?? 0,
						balanceUSD: tokenBalance?.balanceUSD ?? 0
					};
				})
				.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? []
		);
	}, [chainTokenList, selectedChain?.id, tokenBalances, savedTokens]);

	const {
		data: routes = [],
		isLoading,
		isLoaded,
		refetch,
		lastFetched
	} = useGetRoutes({
		chain: selectedChain?.value,
		from: finalSelectedFromToken?.value,
		to: finalSelectedToToken?.value,
		amount: amountWithDecimals,
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount: debouncedAmount,
			fromToken: finalSelectedFromToken,
			toToken: finalSelectedToToken,
			slippage,
			isPrivacyEnabled
		}
	});

	const secondsToRefresh = useCountdown(lastFetched + REFETCH_INTERVAL);

	const { data: gasData, isLoading: isGasDataLoading } = useEstimateGas({
		routes,
		token: finalSelectedFromToken?.address,
		userAddress: address,
		chain: selectedChain.value,
		amount: amountWithDecimals,
		hasEnoughBalance: +debouncedAmount < +balance?.data?.formatted
	});
	const { data: tokenPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain: selectedChain?.value,
		toToken: finalSelectedToToken?.address,
		fromToken: finalSelectedFromToken?.address
	});
	const { gasTokenPrice = 0, toTokenPrice, fromTokenPrice } = tokenPrices || {};

	// format routes
	const fillRoute = (route: typeof routes[0]) => {
		if (!route?.price) return null;
		const gasEstimation = +(!isGasDataLoading && isLoaded && gasData?.[route.name]?.gas
			? gasData?.[route.name]?.gas
			: route.price.estimatedGas);
		let gasUsd: number | string = (gasTokenPrice * gasEstimation * +gasPriceData?.formatted?.gasPrice) / 1e18 || 0;

		// CowSwap native token swap
		gasUsd =
			route.price.feeAmount && finalSelectedFromToken.address === ethers.constants.AddressZero
				? (route.price.feeAmount / 1e18) * gasTokenPrice + gasUsd
				: gasUsd;

		gasUsd = route.l1Gas !== 'Unknown' && route.l1Gas ? route.l1Gas * gasTokenPrice + gasUsd : gasUsd;

		gasUsd = route.l1Gas === 'Unknown' ? 'Unknown' : gasUsd;

		const amount = +route.price.amountReturned / 10 ** +finalSelectedToToken?.decimals;

		const amountUsd = toTokenPrice ? (amount * toTokenPrice).toFixed(2) : null;

		const netOut = amountUsd ? (route.l1Gas !== 'Unknown' ? +amountUsd - +gasUsd : +amountUsd) : amount;

		return {
			...route,
			isFailed: gasData?.[route.name]?.isFailed || false,
			route,
			gasUsd: gasUsd === 0 && route.name !== 'CowSwap' ? 'Unknown' : gasUsd,
			amountUsd,
			amount,
			netOut
		};
	};

	let normalizedRoutes = [...(routes || [])]
		?.map(fillRoute)
		.filter(
			({ fromAmount, amount: toAmount, isFailed }) =>
				Number(toAmount) && amountWithDecimals === fromAmount && isFailed !== true
		)
		.sort((a, b) => {
			if (a.gasUsd === 'Unknown') {
				return 1;
			} else if (b.gasUsd === 'Unknown') {
				return -1;
			}
			return b.netOut - a.netOut;
		})
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));

	const medianAmount = Math.max(
		median(normalizedRoutes.map(({ amount }) => amount)),
		normalizedRoutes.find((r) => r.name === '1inch')?.amount ?? 0
	);

	normalizedRoutes = normalizedRoutes.filter(({ amount }) => amount < medianAmount * 3);

	const selecteRouteIndex =
		aggregator && normalizedRoutes && normalizedRoutes.length > 0
			? normalizedRoutes.findIndex((r) => r.name === aggregator)
			: -1;
	// store selected aggregators route
	const selectedRoute =
		selecteRouteIndex >= 0 ? { ...normalizedRoutes[selecteRouteIndex], index: selecteRouteIndex } : null;

	// functions to handle change in swap input fields
	const onMaxClick = () => {
		if (balance.data && balance.data.formatted && !Number.isNaN(Number(balance.data.formatted))) {
			if (
				selectedRoute &&
				selectedRoute.price.estimatedGas &&
				gasPriceData?.formatted?.gasPrice &&
				finalSelectedFromToken?.address === ethers.constants.AddressZero
			) {
				const gas = (+selectedRoute.price.estimatedGas * +gasPriceData?.formatted?.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance.data.formatted - gas;

				setAmount(amountWithoutGas);
			} else {
				setAmount(balance.data.formatted === '0.0' ? 0 : balance.data.formatted);
			}
		}
	};
	const onChainChange = (newChain) => {
		setAggregator(null);
		router
			.push(
				{
					pathname: '/',
					query: { chain: newChain.value, from: ethers.constants.AddressZero }
				},
				undefined,
				{ shallow: true }
			)
			.then(() => {
				if (switchNetwork) switchNetwork(newChain.chainId);
			});
	};
	const onFromTokenChange = (token) => {
		setSelectedToken(token);
		setCalculate(false);
		setAggregator(null);
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.address } }, undefined, {
			shallow: true
		});
	};
	const onToTokenChange = (token) => () => {
		setAggregator(null);
		setCalculate(true);
		router.push({ pathname: router.pathname, query: { ...router.query, to: token?.address || undefined } }, undefined, {
			shallow: true
		});
	};

	useEffect(() => {
		const isUnknown =
			selectedToToken === null &&
			finalSelectedToToken !== null &&
			savedTokens &&
			!savedTokens.find(({ address }) => address.toLowerCase() === toTokenAddress.toLowerCase());

		if (isUnknown && toTokenAddress && savedTokens?.length > 1) {
			onToTokenChange(undefined);
		}
	}, [router?.query, savedTokens]);

	const priceImpactRoute = selectedRoute ? fillRoute(selectedRoute) : null;

	const selectedRoutesPriceImpact =
		fromTokenPrice &&
		toTokenPrice &&
		priceImpactRoute &&
		priceImpactRoute.amountUsd &&
		debouncedAmount &&
		!Number.isNaN(Number(priceImpactRoute.amountUsd))
			? 100 - (Number(priceImpactRoute.amountUsd) / (+fromTokenPrice * +debouncedAmount)) * 100
			: null;

	const hasPriceImapct =
		selectedRoutesPriceImpact === null || Number(selectedRoutesPriceImpact) > PRICE_IMPACT_WARNING_THRESHOLD;

	//  only show insufficient balance when there is token balance data and debouncedAmount is in sync with amount
	const insufficientBalance =
		balance.isSuccess && balance.data && !Number.isNaN(Number(balance.data.formatted))
			? balance.data.value &&
			  amount &&
			  debouncedAmount &&
			  amountWithDecimals &&
			  amount === debouncedAmount &&
			  +amountWithDecimals > +balance.data.value.toString()
			: false;

	const forceRefreshTokenBalance = () => {
		if (chainOnWallet && address) {
			wagmiClient.invalidateQueries([{ addressOrName: address, chainId: chainOnWallet.id, entity: 'balance' }]);
		}
	};

	// approve/swap tokens
	const {
		isApproved,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isApproveLoading,
		isInfiniteLoading: isApproveInfiniteLoading,
		isResetLoading: isApproveResetLoading,
		isConfirmingApproval,
		isConfirmingInfiniteApproval,
		isConfirmingResetApproval,
		shouldRemoveApproval,
		allowance
	} = useTokenApprove(
		finalSelectedFromToken?.address,
		selectedRoute && selectedRoute.price ? selectedRoute.price.tokenApprovalAddress : null,
		amountWithDecimals
	);
	const isUSDTNotApprovedOnEthereum =
		selectedChain && finalSelectedFromToken && selectedChain.id === 1 && shouldRemoveApproval;
	const swapMutation = useMutation({
		mutationFn: (params: {
			chain: string;
			from: string;
			to: string;
			amount: string;
			adapter: string;
			signer: ethers.Signer;
			slippage: string;
			rawQuote: any;
			tokens: { toToken: IToken; fromToken: IToken };
			index: number;
		}) => swap(params),
		onSuccess: (data, variables) => {
			let txUrl;
			if (data.hash) {
				addRecentTransaction({
					hash: data.hash,
					description: `Swap transaction using ${variables.adapter} is sent.`
				});
				const explorerUrl = chainOnWallet.blockExplorers.default.url;
				setTxModalOpen(true);
				txUrl = `${explorerUrl}/tx/${data.hash}`;
				setTxUrl(txUrl);
			} else {
				setTxModalOpen(true);
				txUrl = `https://explorer.cow.fi/orders/${data.id}`;
				setTxUrl(txUrl);
				data.waitForOrder(() => {
					forceRefreshTokenBalance();

					toast(formatSuccessToast(variables));

					sendSwapEvent({
						chain: selectedChain.value,
						user: address,
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError,
						quote: variables.rawQuote,
						txUrl,
						amount: String(debouncedAmount),
						errorData: {},
						amountUsd: +fromTokenPrice * +debouncedAmount || 0,
						slippage,
						routePlace: String(variables?.index)
					});
				});
			}

			confirmingTxToastRef.current = toast({
				title: 'Confirming Transaction',
				description: '',
				status: 'loading',
				isClosable: true,
				position: 'top-right'
			});

			let isError = false;

			data
				.wait?.()
				?.then((final) => {
					if (final.status === 1) {
						forceRefreshTokenBalance();

						if (confirmingTxToastRef.current) {
							toast.close(confirmingTxToastRef.current);
						}

						toast(formatSuccessToast(variables));
					} else {
						isError = true;
						toast({
							title: 'Transaction Failed',
							status: 'error',
							duration: 10000,
							isClosable: true,
							position: 'top-right',
							containerStyle: {
								width: '100%',
								maxWidth: '300px'
							}
						});
					}
				})
				.catch(() => {
					isError = true;
					toast({
						title: 'Transaction Failed',
						status: 'error',
						duration: 10000,
						isClosable: true,
						position: 'top-right',
						containerStyle: {
							width: '100%',
							maxWidth: '300px'
						}
					});
				})
				?.finally(() => {
					sendSwapEvent({
						chain: selectedChain.value,
						user: address,
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError,
						quote: variables.rawQuote,
						txUrl,
						amount: String(debouncedAmount),
						errorData: {},
						amountUsd: +fromTokenPrice * +debouncedAmount || 0,
						slippage,
						routePlace: String(variables?.index)
					});
				});
		},
		onError: (err: { reason: string; code: string }, variables) => {
			if (err.code !== 'ACTION_REJECTED' || err.code.toString() === '-32603') {
				toast({
					title: 'Something went wrong.',
					description: err.reason,
					status: 'error',
					duration: 10000,
					isClosable: true,
					position: 'top-right',
					containerStyle: {
						width: '100%',
						maxWidth: '300px'
					}
				});

				sendSwapEvent({
					chain: selectedChain.value,
					user: address,
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: true,
					quote: variables.rawQuote,
					txUrl: '',
					amount: String(debouncedAmount),
					errorData: err,
					amountUsd: fromTokenPrice * +debouncedAmount || 0,
					slippage,
					routePlace: String(variables?.index)
				});
			}
		}
	});

	const handleSwap = () => {
		if (selectedRoute && selectedRoute.price) {
			swapMutation.mutate({
				chain: selectedChain.value,
				from: finalSelectedFromToken.value,
				to: finalSelectedToToken.value,
				amount: amountWithDecimals,
				signer,
				slippage,
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken },
				index: selectedRoute.index
			});
		}
	};
	// console.log(finalSelectedFromToken);
	return (
		<div style={{ marginTop: '100px' }}>
			<Wrapper>
				<div style={{ display: 'flex' }}>
					<img src="group.png" width="88px" height="73px" style={{ marginLeft: '250px', marginRight: '30px' }} />
					<p style={{ fontSize: '40px', fontWeight: 'bold', color: 'black' }}>Alpaca</p>
					<img src="Line1.png" style={{ marginLeft: '70px' }} />
					<p style={{ color: '#E2000F', fontSize: '30px', fontWeight: 'bold', marginLeft: '70px', marginTop: '15px' }}>
						PERPETUAL META-AGGREGATOR
					</p>
				</div>

				<BodyWrapper>
					<Body showRoutes={finalSelectedFromToken && finalSelectedToToken ? true : false}>
						<div>
							<FormHeader>
								<Flex>
									<p style={{ color: '#181B20', marginBottom: '20px', fontSize: '20px' }}>Asset Pair</p>
									{/* <Spacer /> */}
									{/* <Tooltip content="Redirect requests through the DefiLlama Server to hide your IP address">
										<FormControl display="flex" alignItems="baseline" gap="6px" justifyContent={'center'}>
											<FormLabel htmlFor="privacy-switch" margin={0} fontSize="14px" color="gray.400">
												Hide IP
											</FormLabel>
											<Switch
												id="privacy-switch"
												onChange={(e) => setIsPrivacyEnabled(e?.target?.checked)}
												isChecked={isPrivacyEnabled}
											/>
										</FormControl>
									</Tooltip> */}
								</Flex>
							</FormHeader>
							<TokenSelect
								tokens={tokensInChain.filter(({ address }) => address !== finalSelectedToToken?.address)}
								token={finalSelectedFromToken}
								onClick={onFromTokenChange}
								selectedChain={selectedChain}
							/>

							{/* <ReactSelect options={chains} value={selectedChain} onChange={onChainChange} /> */}
						</div>

						<SelectWrapper>
							{/* <TokenSelectBody>
								<TokenSelect
									tokens={tokensInChain.filter(({ address }) => address !== finalSelectedToToken?.address)}
									token={finalSelectedFromToken}
									onClick={onFromTokenChange}
									selectedChain={selectedChain}
								/>

								<IconButton
									onClick={() =>
										router.push(
											{
												pathname: router.pathname,
												query: {
													...router.query,
													to: finalSelectedFromToken.address,
													from: finalSelectedToToken.address
												}
											},
											undefined,
											{ shallow: true }
										)
									}
									bg="none"
									icon={<ArrowRight size={16} />}
									aria-label="Switch Tokens"
									marginTop="auto"
								/>

								<TokenSelect
									tokens={tokensInChain.filter(({ address }) => address !== finalSelectedFromToken?.address)}
									token={finalSelectedToToken}
									onClick={onToTokenChange}
									selectedChain={selectedChain}
								/>
							</TokenSelectBody> */}
							<Text as="span" fontWeight="bold" fontSize="1rem" ml="4px" color={'#181B20'}>
								Collateral
							</Text>
							<Flex gap="2">
								{/* <TokenInput setAmount={setAmount} amount={amount} onMaxClick={onMaxClick}  /> */}
								<input
									value={100}
									style={{
										width: '50%',
										backgroundColor: 'rgb(0,0,0,0)',
										borderColor: 'rgb(0,0,0,0)',
										fontWeight: 'bold',
										color: '#181B20',
										fontSize: '40px'
									}}
								/>
								<Space />
								<Select   options = {options} styles={styles}  />
								{/* {balance.isSuccess && balance.data && !Number.isNaN(Number(balance.data.formatted)) ? (
									<Button
										textDecor="underline"
										bg="none"
										p={0}
										fontWeight="400"
										fontSize="0.875rem"
										ml="auto"
										h="initial"
										mt="8px"
										onClick={onMaxClick}
										_hover={{ bg: 'none' }}
										_focus={{ bg: 'none' }}
									>
										Balance: {(+balance.data.formatted).toFixed(3)}
									</Button>
								) : (
									<Box h="16.8px" mt="8px"></Box>
								)} */}
							</Flex>
						</SelectWrapper>

						{/* <Flex as="label" flexDir="column">
			<Text as="span" fontWeight="bold" fontSize="1rem" ml="4px">
				Amount In {finalSelectedFromToken?.symbol}
			</Text>
			<TokenInput setAmount={setAmount} amount={amount} onMaxClick={onMaxClick} />

			{balance.isSuccess && balance.data && !Number.isNaN(Number(balance.data.formatted)) ? (
				<Button
					textDecor="underline"
					bg="none"
					p={0}
					fontWeight="400"
					fontSize="0.875rem"
					ml="auto"
					h="initial"
					mt="8px"
					onClick={onMaxClick}
					_hover={{ bg: 'none' }}
					_focus={{ bg: 'none' }}
				>
					Balance: {(+balance.data.formatted).toFixed(3)}
				</Button>
			) : (
				<Box h="16.8px" mt="8px"></Box>
			)}
		</Flex> */}
						<Flex>
							<Text as="span" fontWeight="bold" fontSize="1rem" ml="4px" mt="2px" mb="4px" color={'black'}>
								Leverage(2x-100x)
							</Text>
							<Spacer />
							<InputNumber
								style={{ background: '' }}
								min={0}
								value={typeof editing.blur === 'number' ? editing.blur : 0}
								onChange={(newBlur) => setEditing({ ...editing, blur: newBlur })}
							/>
						</Flex>

						<Slider
							marks={marks}
							trackStyle={{ backgroundColor: '#77911' }}
							value={typeof editing.blur === 'number' ? editing.blur : 0}
							max={100}
							min={2}
							onChange={(newblur) => setEditing({ ...editing, blur: newblur })}
						/>

						{/* <Slippage slippage={slippage} setSlippage={setSlippage} /> */}

						<PriceImpact
							isLoading={isLoading || fetchingTokenPrices}
							fromTokenPrice={fromTokenPrice}
							fromToken={finalSelectedFromToken}
							toTokenPrice={toTokenPrice}
							toToken={finalSelectedToToken}
							amountReturnedInSelectedRoute={
								priceImpactRoute && priceImpactRoute.price && priceImpactRoute.price.amountReturned
							}
							selectedRoutesPriceImpact={selectedRoutesPriceImpact}
							amount={debouncedAmount}
							slippage={slippage}
						/>

						{/* {aggregator === 'CowSwap' ? (
			<>
				{finalSelectedFromToken.value === ethers.constants.AddressZero && Number(slippage) < 2 ? (
					<Alert status="warning" borderRadius="0.375rem" py="8px">
						<AlertIcon />
						Swaps from {finalSelectedFromToken.symbol} on CowSwap need to have slippage higher than 2%.
					</Alert>
				) : null}
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					CowSwap orders are fill-or-kill, so they may not execute if price moves quickly against you.
				</Alert>
			</>
		) : null} */}
						<Button bgColor={'#381CB8'} onClick={onToTokenChange(finalSelectedFromToken)}>
							Calculate
						</Button>

						<Connect></Connect>
						{/* <SwapWrapper>
							{!ethereumAccount ? (
								<Button bgColor={'#2D00FF'} onClick={connectMetamaskWallet} marginBottom={'20px'}>
									Connect Wallet
								</Button>
							) : !isValidSelectedChain ? (
								<Button bgColor={'#2D00FF'} onClick={() => switchNetwork?.(selectedChain.id)}>
									Switch Network
								</Button>
							) : insufficientBalance ? (
								<Button bgColor={'#2D00FF'} disabled>
									Insufficient Balance
								</Button>
							) : (
								<>
									{router && address && (
										<>
											<>
												{isUSDTNotApprovedOnEthereum && (
													<Flex flexDir="column" gap="4px" w="100%">
														<Text fontSize="0.75rem" fontWeight={400}>
															{`${
																finalSelectedFromToken?.symbol
															} uses an old token implementation that requires resetting approvals if there's a
											previous approval, and you currently have an approval for ${(
												Number(allowance) /
												10 ** finalSelectedFromToken?.decimals
											).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
											need to reset your approval and approve again`}
														</Text>
														<Button
															isLoading={isApproveResetLoading}
															loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
															colorScheme={'messenger'}
															onClick={() => {
																if (approveReset) approveReset();
															}}
															disabled={isApproveResetLoading || !selectedRoute}
														>
															Reset Approval
														</Button>
													</Flex>
												)}

												{hasPriceImapct && !isLoading && selectedRoute && isApproved ? (
													<SwapConfirmation handleSwap={handleSwap} />
												) : (
													<Button
														isLoading={swapMutation.isLoading || isApproveLoading}
														loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
														colorScheme={'messenger'}
														onClick={() => {
															//scroll Routes into view
															!selectedRoute && routesRef.current.scrollIntoView({ behavior: 'smooth' });

															if (approve) approve();

															if (
																balance.data &&
																!Number.isNaN(Number(balance.data.formatted)) &&
																+debouncedAmount > +balance.data.formatted
															)
																return;

															if (isApproved) handleSwap();
														}}
														disabled={
															isUSDTNotApprovedOnEthereum ||
															swapMutation.isLoading ||
															isApproveLoading ||
															isApproveResetLoading ||
															!(debouncedAmount && finalSelectedFromToken && finalSelectedToToken) ||
															!selectedRoute
														}
													>
														{!selectedRoute
															? 'Select Aggregator'
															: isApproved
															? `Swap via ${selectedRoute.name}`
															: 'Approve'}
													</Button>
												)}

												{!isApproved && selectedRoute && inifiniteApprovalAllowed.includes(selectedRoute.name) && (
													<Button
														colorScheme={'messenger'}
														loadingText={isConfirmingInfiniteApproval ? 'Confirming' : 'Preparing transaction'}
														isLoading={isApproveInfiniteLoading}
														onClick={() => {
															if (approveInfinite) approveInfinite();
														}}
														disabled={
															isUSDTNotApprovedOnEthereum ||
															swapMutation.isLoading ||
															isApproveLoading ||
															isApproveResetLoading ||
															isApproveInfiniteLoading ||
															!selectedRoute
														}
													>
														{'Approve Infinite'}
													</Button>
												)}
											</>
										</>
									)}
								</>
							)}
						</SwapWrapper> */}
					</Body>

					<Routes ref={routesRef}>
						{normalizedRoutes?.length ? (
							<Flex alignItems="center" justifyContent="space-between">
								<p style={{ color: '#121212', fontWeight: 'bold', fontSize: '20px' }}>
									Select a route to perform a swap{' '}
								</p>
								<Tooltip2
									content={`Displayed data will auto-refresh after ${secondsToRefresh} seconds. Click here to update manually`}
								>
									<RepeatIcon pos="absolute" w="16px" h="16px" mt="4px" ml="4px" />
									<CircularProgress
										value={100 - (secondsToRefresh / (REFETCH_INTERVAL / 1000)) * 100}
										color="blue.400"
										onClick={refetch}
										size="24px"
										as="button"
									/>
								</Tooltip2>
							</Flex>
						) : !isLoading &&
						  amount &&
						  debouncedAmount &&
						  amount === debouncedAmount &&
						  finalSelectedFromToken &&
						  finalSelectedToToken &&
						  routes &&
						  routes.length && !isCalculate ? (
							<FormHeader>No available routes found</FormHeader>
						) : null}
						<span style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
							{normalizedRoutes?.length ? 'Best route is selected based on net output after gas fees' : null}
						</span>

						{isLoading && debouncedAmount && finalSelectedFromToken && finalSelectedToToken ? (
							<Loader />
						) : !debouncedAmount || !finalSelectedFromToken || !finalSelectedToToken || !router.isReady ? (
							<RoutesPreview />
						) : null}

						{!isCalculate && normalizedRoutes.map((r, i) => (
							<Fragment
								key={
									selectedChain.label +
									finalSelectedFromToken.label +
									finalSelectedToToken.label +
									amountWithDecimals +
									gasPriceData?.formatted?.gasPrice +
									r?.name
								}
							>
								
								<SwapRoute
									{...r}
									index={i}
									currentPrice={price}
									symbol={selectedToken?.symbol}
									selected={aggregator === r.name}
									setRoute={() => setAggregator(r.name)}
									toToken={finalSelectedToToken}
									amountFrom={amountWithDecimals}
									fromToken={finalSelectedFromToken}
									selectedChain={selectedChain.label}
									gasTokenPrice={gasTokenPrice}
									isFetchingGasPrice={fetchingTokenPrices}
								/>

								{aggregator === r.name && (
									<SwapUnderRoute>
										{!ethereumAccount ? (
											<ConnectButtonWrapper>
												<ConnectButton />
											</ConnectButtonWrapper>
										) : !isValidSelectedChain ? (
											<Button colorScheme={'messenger'} onClick={() => switchNetwork?.(selectedChain.id)}>
												Switch Network
											</Button>
										) : (
											<>
												{router && address && (
													<>
														<>
															{isUSDTNotApprovedOnEthereum && (
																<Flex flexDir="column" gap="4px" w="100%">
																	<Text fontSize="0.75rem" fontWeight={400}>
																		{`${
																			finalSelectedFromToken?.symbol
																		} uses an old token implementation that requires resetting approvals if there's a
															previous approval, and you currently have an approval for ${(
																Number(allowance) /
																10 ** finalSelectedFromToken?.decimals
															).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
															need to reset your approval and approve again`}
																	</Text>
																	<Button
																		isLoading={isApproveResetLoading}
																		loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
																		colorScheme={'messenger'}
																		onClick={() => {
																			if (approveReset) approveReset();
																		}}
																		disabled={isApproveResetLoading || !selectedRoute}
																	>
																		Reset Approval
																	</Button>
																</Flex>
															)}

															{hasPriceImapct && !isLoading && selectedRoute && isApproved ? (
																<SwapConfirmation handleSwap={handleSwap} />
															) : (
																<Button
																	isLoading={swapMutation.isLoading || isApproveLoading}
																	loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
																	colorScheme={'messenger'}
																	onClick={() => {
																		if (approve) approve();

																		if (
																			balance.data &&
																			!Number.isNaN(Number(balance.data.formatted)) &&
																			+debouncedAmount > +balance.data.formatted
																		)
																			return;

																		if (isApproved) handleSwap();
																	}}
																	disabled={
																		isUSDTNotApprovedOnEthereum ||
																		swapMutation.isLoading ||
																		isApproveLoading ||
																		isApproveResetLoading ||
																		!selectedRoute
																	}
																>
																	{!selectedRoute
																		? 'Select Aggregator'
																		: isApproved
																		? `Swap via ${selectedRoute?.name}`
																		: 'Approve'}
																</Button>
															)}

															{!isApproved && selectedRoute && inifiniteApprovalAllowed.includes(selectedRoute.name) && (
																<Button
																	colorScheme={'messenger'}
																	loadingText={isConfirmingInfiniteApproval ? 'Confirming' : 'Preparing transaction'}
																	isLoading={isApproveInfiniteLoading}
																	onClick={() => {
																		if (approveInfinite) approveInfinite();
																	}}
																	disabled={
																		isUSDTNotApprovedOnEthereum ||
																		swapMutation.isLoading ||
																		isApproveLoading ||
																		isApproveResetLoading ||
																		isApproveInfiniteLoading ||
																		!selectedRoute
																	}
																>
																	{'Approve Infinite'}
																</Button>
															)}
														</>
													</>
												)}
											</>
										)}
									</SwapUnderRoute>
								)}
							</Fragment>
						))
						}
						{isCalculate && (
							<>
								<CalculateRoute
									key="0"
									currentPrice={price}
									symbol={selectedToken?.symbol}
									selected={false}
									type="gains.trade"
									onCalClick={onCalClick}
									toToken={finalSelectedToToken}
									amountFrom={amountWithDecimals}
									fromToken={finalSelectedFromToken}
									selectedChain={selectedChain.label}
									gasTokenPrice={gasTokenPrice}
									isFetchingGasPrice={fetchingTokenPrices}
								/>

								<CalculateRoute
									key="1"
									currentPrice={gmxPrice}
									symbol={selectedToken?.symbol}
									selected={false}
									onCalClick={onCalClick}
									type="GMX"
									toToken={finalSelectedToToken}
									amountFrom={amountWithDecimals}
									fromToken={finalSelectedFromToken}
									selectedChain={selectedChain.label}
									gasTokenPrice={gasTokenPrice}
									isFetchingGasPrice={fetchingTokenPrices}
								/>
							</>

						)}
						
					</Routes>
				</BodyWrapper>

				<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
			</Wrapper>
		</div>
	);
}
