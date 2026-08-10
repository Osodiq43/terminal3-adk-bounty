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

export async function connect() {
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

  const tenant = new TenantClient({ t3n, tenantDid });

  return { t3n, tenant, tenantDid };
}

const { tenantDid } = await connect();
console.log("Tenant DID:", tenantDid);
console.log("TenantClient ready.");
