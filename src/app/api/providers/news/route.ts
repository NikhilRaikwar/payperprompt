import { NextRequest, NextResponse } from 'next/server';

// NewsAPI — x402 payment-gated endpoint
const PROVIDER_WALLET = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';
const PYUSD_ADDRESS   = '0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9';
const PRICE_WEI       = '10000000000000000'; // 0.010 PYUSD in wei
const PRICE_DISPLAY   = '0.010 PYUSD';

const PAYMENT_TERMS = {
  error: 'X-PAYMENT header is required',
  accepts: [{
    scheme:             'gokite-aa',
    network:            'kite-testnet',
    maxAmountRequired:  PRICE_WEI,
    resource:           `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/providers/news`,
    description:        'NewsAPI — Top headlines from 50,000+ sources, deduplicated',
    mimeType:           'application/json',
    outputSchema: {
      input: { discoverable: true, method: 'GET', queryParams: { topic: { description: 'Topic or category', required: false, type: 'string' } }, type: 'http' },
      output: { properties: { headlines: { type: 'array' } }, required: ['headlines'], type: 'object' }
    },
    payTo:             PROVIDER_WALLET,
    maxTimeoutSeconds: 300,
    asset:             PYUSD_ADDRESS,
    extra:             null,
    merchantName:      'NewsAPI — PayPerPrompt',
  }],
  x402Version: 1,
};

export async function GET(req: NextRequest) {
  const txHash = req.headers.get('x-payment-tx');
  const from   = req.headers.get('x-payer-address');

  if (!txHash || !from) {
    return NextResponse.json(PAYMENT_TERMS, { status: 402 });
  }

  return NextResponse.json({
    provider:     'NewsAPI',
    priceCharged: PRICE_DISPLAY,
    settledOn:    'Kite Testnet (Chain 2368)',
    txHash,
    data: {
      fetchedAt: new Date().toISOString(),
      headlines: [
        { title: 'AI agent economy reaches $50B milestone', source: 'TechCrunch', sentiment: 'positive', url: 'https://techcrunch.com' },
        { title: 'Kite AI launches agentic payment infrastructure', source: 'CoinDesk', sentiment: 'positive', url: 'https://coindesk.com' },
        { title: 'EIP-3009 gasless transfers see record adoption', source: 'Decrypt', sentiment: 'positive', url: 'https://decrypt.co' },
        { title: 'On-chain API marketplaces compete with AWS', source: 'The Block', sentiment: 'neutral', url: 'https://theblock.co' },
      ],
    },
  });
}
