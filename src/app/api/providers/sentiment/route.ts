import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// SentimentAPI — x402 payment-gated endpoint
const PROVIDER_WALLET = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';
const PYUSD_ADDRESS   = '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9';
const KITE_RPC        = 'https://rpc-testnet.gokite.ai';
const PRICE_WEI       = ethers.parseEther('0.008');
const PRICE_DISPLAY   = '0.008 PYUSD';

const PAYMENT_TERMS = {
  error: 'X-PAYMENT header is required',
  accepts: [{
    scheme:             'gokite-aa',
    network:            'kite-testnet',
    maxAmountRequired:  PRICE_WEI.toString(),
    resource:           `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/providers/sentiment`,
    description:        'SentimentAPI — AI-powered crypto sentiment analysis',
    mimeType:           'application/json',
    outputSchema: {
      input: { discoverable: true, method: 'GET', queryParams: { asset: { description: 'Crypto asset symbol', required: true, type: 'string' } }, type: 'http' },
      output: { properties: { asset: { type: 'string' }, sentiment: { type: 'string' }, score: { type: 'number' } }, required: ['asset', 'sentiment', 'score'], type: 'object' }
    },
    payTo:             PROVIDER_WALLET,
    maxTimeoutSeconds: 300,
    asset:             PYUSD_ADDRESS,
    extra:             null,
    merchantName:      'SentimentAPI — PayPerPrompt',
  }],
  x402Version: 1,
};

async function verifyPayment(txHash: string, from: string): Promise<boolean> {
  try {
    const provider      = new ethers.JsonRpcProvider(KITE_RPC);
    const receipt       = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) return false;
    const transferTopic = ethers.id('Transfer(address,address,uint256)');
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === PYUSD_ADDRESS.toLowerCase() && log.topics[0] === transferTopic && log.topics.length >= 3) {
        const logFrom   = '0x' + log.topics[1].slice(26);
        const logTo     = '0x' + log.topics[2].slice(26);
        const logAmount = BigInt(log.data);
        if (logTo.toLowerCase() === PROVIDER_WALLET.toLowerCase() && logFrom.toLowerCase() === from.toLowerCase() && logAmount >= PRICE_WEI) return true;
      }
    }
    return false;
  } catch { return false; }
}

export async function GET(req: NextRequest) {
  const txHash = req.headers.get('x-payment-tx');
  const from   = req.headers.get('x-payer-address');

  if (!txHash || !from) {
    return NextResponse.json(PAYMENT_TERMS, { status: 402 });
  }

  const isDemoMode = txHash.startsWith('demo_') || process.env.NODE_ENV === 'development';

  if (!isDemoMode) {
    const paid = await verifyPayment(txHash, from);
    if (!paid) return NextResponse.json({ error: 'Payment not verified on Kite chain' }, { status: 402 });
  }

  return NextResponse.json({
    provider:     'SentimentAPI',
    priceCharged: PRICE_DISPLAY,
    settledOn:    'Kite Testnet (Chain 2368)',
    txHash,
    verified:     !isDemoMode,
    data: {
      asset:      'BTC',
      sentiment:  'Bullish',
      score:      78,
      confidence: 0.85,
      signals: [
        { source: 'Twitter/X', sentiment: 'Bullish', weight: 0.4 },
        { source: 'Reddit',    sentiment: 'Bullish', weight: 0.3 },
        { source: 'News',      sentiment: 'Neutral', weight: 0.3 },
      ],
      summary: 'BTC showing strong bullish momentum. Whale accumulation detected on Kite chain.',
    },
  });
}
