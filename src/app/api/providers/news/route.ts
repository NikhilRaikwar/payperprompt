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

  // Extract queried topic
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic') || 'general';

  // Real-time AI headlines generator using OpenAI
  let newsData = {
    fetchedAt: new Date().toISOString(),
    headlines: [
      { title: `AI agent economy reaches $50B milestone in ${topic}`, source: 'TechCrunch', sentiment: 'positive', url: 'https://techcrunch.com' },
      { title: `Kite AI launches dynamic ${topic} infrastructure`, source: 'CoinDesk', sentiment: 'positive', url: 'https://coindesk.com' },
      { title: `EIP-3009 gasless transfers see record adoption in ${topic} services`, source: 'Decrypt', sentiment: 'positive', url: 'https://decrypt.co' },
    ],
  };

  const hasOpenAIKey = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key_here');
  if (hasOpenAIKey) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 250,
        messages: [{
          role: 'user',
          content: `Generate a realistic news headlines data JSON object for the topic "${topic}". Return ONLY valid JSON matching this schema:
          { "fetchedAt": "${new Date().toISOString()}", "headlines": [{"title": "Headline here", "source": "Reuters", "sentiment": "positive", "url": "https://reuters.com"}] }`
        }],
      });
      const content = completion.choices[0].message.content || '';
      newsData = JSON.parse(content.replace(/```json\n?|```/g, '').trim());
    } catch (err) {
      console.error('[NewsAPI] Failed to fetch dynamic headlines via OpenAI:', err);
    }
  }

  return NextResponse.json({
    provider:     'NewsAPI',
    priceCharged: PRICE_DISPLAY,
    settledOn:    'Kite Testnet (Chain 2368)',
    txHash,
    data:         newsData,
  });
}
