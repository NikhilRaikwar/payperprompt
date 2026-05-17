const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to Kite Testnet (2368) with:", deployer.address);
  
  const Registry = await ethers.getContractFactory("APIRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  
  const addr = await registry.getAddress();
  console.log("APIRegistry deployed to:", addr);
  console.log("View on KiteScan:", `https://testnet.kitescan.ai/address/${addr}`);
  
  // Seed 3 mock services
  await registry.registerService("WeatherAPI", "https://mock.payperprompt.ai/weather", 
    ethers.parseUnits("0.005", 18), ["weather","realtime"]);
  await registry.registerService("SentimentAPI", "https://mock.payperprompt.ai/sentiment",
    ethers.parseUnits("0.008", 18), ["ai","sentiment","crypto"]);
  await registry.registerService("NewsAPI", "https://mock.payperprompt.ai/news",
    ethers.parseUnits("0.010", 18), ["news","media"]);
  
  console.log("Seeded 3 mock API providers");
}
main().catch(console.error);
