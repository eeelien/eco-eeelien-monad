import { createConfig, http } from "wagmi";
import { monadTestnet } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wagmiConfig = getDefaultConfig({
  appName: "eco eeelien ♻️",
  projectId: "eco-eeelien-monad-blitz",
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});
