import {
  T3nClient,
  loadWasmComponent,
  createEthAuthInput,
  eth_get_address,
  metamask_sign,
  TenantClient,
} from "@terminal3/t3n-sdk";

const NODE_URL = "https://cn-api.sg.testnet.t3n.terminal3.io";

async function main() {
  console.log("Loading WASM component...");
  const wasmComponent = await loadWasmComponent();

  console.log("Setting up identity from API key...");
  const privateKey = process.env.T3N_API_KEY!;
  const address = eth_get_address(privateKey);
  console.log("ETH address:", address);

  console.log("Connecting to T3N testnet...");
  const t3n = new T3nClient({
    baseUrl: NODE_URL,
    wasmComponent,
    trustAnchor: { unsafe_trust_server: true },
    handlers: {
      EthSign: metamask_sign(address, undefined, privateKey),
    },
  });

  await t3n.handshake();
  console.log("Handshake complete.");

  const tenantDid = await t3n.authenticate(
    createEthAuthInput(address)
  );
  console.log("✅ Connected! Your tenant DID:", tenantDid);

  const tenant = new TenantClient({ t3n, tenantDid });
  console.log("✅ TenantClient ready.");
}

main().catch(console.error);
