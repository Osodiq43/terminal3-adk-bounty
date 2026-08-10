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

  // Try tenant.tenant namespace instead of tenant.maps directly
  console.log("tenant.tenant keys:", Object.keys(tenant.tenant || {}));
  console.log("tenant keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(tenant)));

  // Try calling executeControl directly with different payloads
  console.log("\nTrying executeControl with map-create...");
  try {
    const result = await tenant.executeControl("map.create", {
      tail: "secrets",
      visibility: "private",
      writers: { only: [] },
      readers: { only: [] },
    });
    console.log("Result:", result);
  } catch (e: any) {
    console.log("map.create error:", e.message?.slice(0, 200));
  }

  console.log("\nTrying executeControl with tenant.map-create...");
  try {
    const result = await tenant.executeControl("tenant.map-create", {
      tail: "secrets",
      visibility: "private",
      writers: { only: [] },
    });
    console.log("Result:", result);
  } catch (e: any) {
    console.log("tenant.map-create error:", e.message?.slice(0, 200));
  }

  console.log("\nTrying executeControl with kv.create...");
  try {
    const result = await tenant.executeControl("kv.create", {
      tail: "secrets",
      visibility: "private",
      writers: { only: [] },
    });
    console.log("Result:", result);
  } catch (e: any) {
    console.log("kv.create error:", e.message?.slice(0, 200));
  }
}

main().catch(console.error);
