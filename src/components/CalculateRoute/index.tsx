import React, {useState} from 'react';
import styled from 'styled-components';
import Tooltip from '~/components/Tooltip';
import { useTokenApprove } from '../Aggregator/hooks';
import { Flex, Text } from '@chakra-ui/react';
import { AlertCircle, Gift, Unlock } from 'react-feather';
import { GasIcon } from '../Icons';
import { formattedNum } from '~/utils';

interface IToken {
	address: string;
	logoURI: string;
	symbol: string;
	decimals: number;
}

interface IPrice {
	amountReturned: string;
	estimatedGas: string;
	tokenApprovalAddress: string;
	logo: string;
	rawQuote?: {};
}

interface IRoute {
	symbol: any;
	currentPrice: any;
	toToken: IToken;
	fromToken: IToken;
	selectedChain: string;
	setRoute: () => void;
	selected: boolean;
	amountFrom: string;
	gasTokenPrice: number;
	type: string;
	isFetchingGasPrice: boolean;
}

const Route = ({
	currentPrice,
	symbol,
	toToken,
	onCalClick,
	fromToken,
	selected,
	amountFrom,
	type,
	isFetchingGasPrice
}: IRoute) => {
	// const { isApproved } = useTokenApprove(fromToken?.address, price?.tokenApprovalAddress as `0x${string}`, amountFrom);


	// const amount = +currentPrice / 10 ** +toToken?.decimals;
	var amount;
	if(type != 'GMX')
		amount = currentPrice/100000000;
	else amount = currentPrice/1000000000000000000000000000000;
	// console.log('amout=> ', currentPrice/100000000)

	let setTextcolor = '';

	return (
		<RouteWrapper
			onClick={onCalClick}
			className={selected ? 'RouteWrapper is-selected' : 'RouteWrapper'}
			selected={selected}
			best={true}
			
		>
			<RouteRow >
				<Flex alignItems="baseline" >
					<Text fontSize={19} fontWeight={700} color={'#181B20'}>
						{formattedNum(amount)}{' '}
					</Text>
					<Text fontSize={19} fontWeight={600} marginLeft={'4px'} color={'#181B20'}>
						{/* {toToken?.symbol} */}
						USD
					</Text>
				</Flex>
				<Text fontWeight={500} fontSize={16} color={'#181B20'}>
					<Flex as="span" alignItems="center" gap="8px">

							<Text as="span" color="#059669" fontSize={14} fontWeight={700}>
								BEST
							</Text>
					</Flex>
				</Text>
			</RouteRow>

			<RouteRow>
				<Flex className='mobile-column' as="span" columnGap="4px" display="flex" color="#181B20" fontWeight={500}>
					<span></span>
					<span>after fees</span>
				</Flex>

				<Tooltip content="This project has no token and might airdrop one in the future">
					<Gift size={14} color="#A0AEC0" />
				</Tooltip>
				

				<Text display="flex" columnGap="6px" color={'#181B20'} fontWeight={500} ml="auto">
					<Text display="flex" className='mobile-column mobile-flexend' alignItems="center" gap="4px" color="#181B20">
							<Tooltip content="Gas is taken from output amount">
								<Text as="span" display="flex" alignItems="center" gap="4px" color="#181B20" fontWeight={500}>
									 <GasIcon />
									
								</Text>
							</Tooltip>
						<Text display="flex" gap="3px">
							via {type}
							{/* {isApproved ? ( */}
								<Tooltip content="Token is approved for this aggregator.">
									<Unlock size={14} color="#059669" />
								</Tooltip>
							{/* ) : (
								' '
							)}
							{name} */}
						</Text>
					</Text>
				</Text>
			</RouteRow>
		</RouteWrapper>
	);
};

const RouteWrapper = styled.div<{ selected: boolean; best: boolean }>`
	display: grid;
	grid-row-gap: 4px;
	margin-top: 16px;
	&.is-selected {
		background-color: #381CB8;
		color: white;
	}

	background-color: ${({ theme, selected }) =>
		theme.mode === 'dark' ? (selected ? ' #E9EDF0;' : '#E9EDF0;') : selected ? ' #bec1c7;' : ' #dde3f3;'};
	border: ${({ theme }) => (theme.mode === 'dark' ? '1px solid #373944;' : '1px solid #c6cae0;')};
	padding: 7px 15px 9px;
	border-radius: 8px;
	cursor: pointer;

	animation: swing-in-left-fwd 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
	@keyframes swing-in-left-fwd {
		0% {
			transform: rotateX(100deg);
			transform-origin: left;
			opacity: 0;
		}
		100% {
			transform: rotateX(0);
			transform-origin: left;
			opacity: 1;
		}
	}
	.secondary-data {
		opacity: 0;
		transition: opacity 0.2s linear;
	}
	&:hover,
	&.is-selected,
	&:first-of-type {
		.secondary-data {
			opacity: 1;
		}
	}
`;

const RouteRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;

	img {
		width: 15px;
		height: 15px;
		aspect-ratio: 1;
		border-radius: 50%;
		margin: 0 0px 0 6px;
	}
	@media (max-width: 768px) {
		.mobile-column {
			flex-direction: column;
		}
		.mobile-flexend {
			align-items: flex-end;
		}
	}
`;

export default Route;
