import {
  T3nClient,
  loadWasmComponent,
  createEthAuthInput,
  eth_get_address,
  metamask_sign,
  TenantClient,
  LogLevel,
  setGlobalLogLevel,
} from "@terminal3/t3n-sdk";

const NODE_URL = "https://cn-api.sg.testnet.t3n.terminal3.io";

async function main() {
  setGlobalLogLevel(LogLevel.ERROR);
  const wasmComponent = await loadWasmComponent();
  const privateKey = process.env.T3N_API_KEY!;
  const address = eth_get_address(privateKey);
  const t3n = new T3nClient({
    baseUrl: NODE_URL,
    wasmComponent,
    trustAnchor: { unsafe_trust_server: true },
    handlers: {
      EthSign: metamask_sign(address, undefined, privateKey),
    },
  });
  await t3n.handshake();
  const didObj = await t3n.authenticate(createEthAuthInput(address));
  const tenantDid = didObj.toString();
  const tenant = new TenantClient({ t3n, tenantDid, baseUrl: NODE_URL });
  console.log("Connected as:", tenantDid);

  // Create secrets map
  console.log("Creating secrets map...");
  try {
    await tenant.maps.create({
      tail: "secrets",
      visibility: "private",
      writers: { only: [] },
      readers: { only: [] },
    });
    console.log("Secrets map created.");
  } catch (e: any) {
    if (e.message?.includes("already exists") || e.message?.includes("AlreadyExists")) {
      console.log("Secrets map already exists, continuing.");
    } else {
      throw e;
    }
  }

  // Seed the Duffel API key
  console.log("Seeding Duffel API key...");
  await tenant.maps.entrySet("secrets", "duffel_api_key", process.env.DUFFEL_API_KEY ?? "placeholder-key");
  console.log("Duffel API key seeded.");
}

main().catch(console.error);
