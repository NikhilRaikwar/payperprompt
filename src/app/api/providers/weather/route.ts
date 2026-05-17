import { NextResponse } from "next/server";

export async function GET() {
  // In production: verify EIP-3009 payment before responding
  return NextResponse.json({
    provider: "WeatherAPI",
    data: {
      city: "New York",
      temp: "22°C",
      humidity: "65%",
      condition: "Partly cloudy",
      wind: "14 km/h SW"
    },
    priceCharged: "0.005 USDC",
    settledOn: "Kite Testnet"
  });
}
