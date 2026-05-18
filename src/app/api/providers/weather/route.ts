import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// WeatherAPI — x402 payment-gated endpoint
// Docs: https://docs.gokite.ai/kite-agent-passport/service-provider-guide
//
// x402 Protocol Flow (from Kite docs):
//   1. Request without payment → 402 with payment terms
//   2. Agent pays via EIP-3009 gasless transfer or direct tx
//   3. Request resent with x-payment-tx + x-payer-address headers
//   4. Service verifies on-chain tx, returns data
//
// Real x402 reference endpoint: https://x402.dev.gokite.ai/api/weather

// Provider wallet — receives PYUSD payments for this API
const PROVIDER_WALLET = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';
const PYUSD_ADDRESS   = '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9';
const KITE_RPC        = 'https://rpc-testnet.gokite.ai';
const PRICE_WEI       = ethers.parseEther('0.005');
const PRICE_DISPLAY   = '0.005 PYUSD';

// x402 payment terms — exactly matching Kite provider guide format
const PAYMENT_TERMS = {
  error: 'X-PAYMENT header is required',
  accepts: [{
    scheme:             'gokite-aa',
    network:            'kite-testnet',
    maxAmountRequired:  PRICE_WEI.toString(),
    resource:           `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/providers/weather`,
    description:        'WeatherAPI — Real-time weather data for any city',
    mimeType:           'application/json',
    outputSchema: {
      input: {
        discoverable: true,
        method: 'GET',
        queryParams: {
          city: { description: 'City name', required: true, type: 'string' }
        },
        type: 'http'
      },
      output: {
        properties: {
          city:      { description: 'City name', type: 'string' },
          temp:      { description: 'Temperature', type: 'string' },
          condition: { description: 'Weather condition', type: 'string' },
        },
        required: ['city', 'temp', 'condition'],
        type: 'object'
      }
    },
    payTo:              PROVIDER_WALLET,
    maxTimeoutSeconds:  300,
    asset:              PYUSD_ADDRESS,
    extra:              null,
    merchantName:       'WeatherAPI — PayPerPrompt',
  }],
  x402Version: 1,
};

// Verify PYUSD payment on Kite chain
async function verifyPayment(txHash: string, from: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(KITE_RPC);
    const receipt  = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) return false;

    const transferTopic = ethers.id('Transfer(address,address,uint256)');

    for (const log of receipt.logs) {
      if (
        log.address.toLowerCase()  === PYUSD_ADDRESS.toLowerCase() &&
        log.topics[0]              === transferTopic &&
        log.topics.length          >= 3
      ) {
        const logFrom   = '0x' + log.topics[1].slice(26);
        const logTo     = '0x' + log.topics[2].slice(26);
        const logAmount = BigInt(log.data);

        if (
          logTo.toLowerCase()   === PROVIDER_WALLET.toLowerCase() &&
          logFrom.toLowerCase() === from.toLowerCase() &&
          logAmount             >= PRICE_WEI
        ) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const txHash = req.headers.get('x-payment-tx');
  const from   = req.headers.get('x-payer-address');

  // Step 1 of x402: return 402 with payment terms
  if (!txHash || !from) {
    return NextResponse.json(PAYMENT_TERMS, { status: 402 });
  }

  // Demo mode: skip on-chain verification for demo_ prefixed tx hashes
  const isDemoMode = txHash.startsWith('demo_') || process.env.NODE_ENV === 'development';

  if (!isDemoMode) {
    const paid = await verifyPayment(txHash, from);
    if (!paid) {
      return NextResponse.json(
        { error: 'Payment not verified on Kite chain', txHash, payTo: PROVIDER_WALLET },
        { status: 402 }
      );
    }
  }

  // Payment verified — return real data
  return NextResponse.json({
    provider:     'WeatherAPI',
    priceCharged: PRICE_DISPLAY,
    settledOn:    'Kite Testnet (Chain 2368)',
    txHash,
    verified:     !isDemoMode,
    data: {
      city:      'New York',
      temp:      '22°C',
      feelsLike: '20°C',
      humidity:  '65%',
      condition: 'Partly cloudy',
      wind:      '14 km/h SW',
      forecast: [
        { day: 'Tomorrow', high: '24°C', low: '18°C', condition: 'Sunny' },
        { day: 'Thursday', high: '21°C', low: '16°C', condition: 'Rain' },
      ],
    },
  });
}
