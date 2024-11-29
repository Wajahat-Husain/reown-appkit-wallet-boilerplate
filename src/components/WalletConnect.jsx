import React, { useEffect, useContext } from "react";
import ConnectionContext from "../context/ConnectionContext";
import { useNavigate } from "react-router-dom";
import {
  createAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useDisconnect,
  useAppKitProvider,
  useWalletInfo,
  useAppKit,
} from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { bscTestnet, sepolia, defineChain } from "@reown/appkit/networks";
import { BrowserProvider } from "ethers";

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID;
if (!projectId)
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");

// 2. Set the networks
const networks = [bscTestnet, sepolia];

// 3. Create a metadata object - optional
const metadata = {
  name: "Social Quest",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// Define the custom network
const binanceTestnet = defineChain({
  id: 97,
  caipNetworkId: "eip155:97",
  chainNamespace: "eip155",
  name: "BNB Smart Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tBNB",
    symbol: "tBNB",
  },
  rpcUrls: {
    default: {
      http: [""],
      webSocket: [""],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet.bscscan.com/" },
  },
  contracts: {
    // Add the contracts here
  },
});

const sepoliaTestnet = defineChain({
  id: 11155111,
  caipNetworkId: "eip155:11155111",
  chainNamespace: "eip155",
  name: "Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "SepoliaETH",
    symbol: "SepoliaETH",
  },
  rpcUrls: {
    default: {
      http: [""],
      webSocket: [""],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://sepolia.etherscan.io/" },
  },
  contracts: {
    // Add the contracts here
  },
});

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  // networks: [binanceTestnet, sepoliaTestnet],
  metadata,
  projectId,
  allWallets: "ONLY_MOBILE",
  allowUnsupportedChain: false,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    swaps: false,
    email: false, // default to true
    socials: [], //"google", "x", "github", "discord",  "apple", "facebook", "farcaster"
    emailShowWallets: false, // default to true, if 'false' Continue with a wallet button in stead of wallet(metamask, wallet connect) if email or any otheer socail is enable and provided
  },
  featuredWalletIds: [], // wallets that are going to be shown on the modal's main view.
  excludeWalletIds: [],
  enableCoinbase: true, // true by default
  coinbasePreference: "eoaOnly", //eoaOnly, smartWalletOnly, all
  tokens: {
    "eip155:97": {
      address: "0x12D79D457E935110a5fD52351490063Eff3bcD22",
      image: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=035", //optional
    },
  },
  connectorImages: {
    // Set or override the images of any connector.
    coinbaseWallet: "https://images.mydapp.com/coinbase.png",
    walletConnect: "https://images.mydapp.com/walletconnect.png",
  },
  enableWalletConnect: true,
  // defaultNetwork: binanceTestnet,
  defaultNetwork: bscTestnet,
  termsConditionsUrl: "https://www.mytermsandconditions.com",
  privacyPolicyUrl: "https://www.myprivacypolicy.com",
});

const WalletConnect = () => {
  let navigate = useNavigate();
  const { open, close } = useAppKit();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { caipNetwork, caipNetworkId, chainId, switchNetwork, addNetwork } =
    useAppKitNetwork();
  const { open: isDilogOpen, selectedNetworkId } = useAppKitState();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useAppKitProvider("eip155");
  const { setUserInfo, setSigner, userInfo, signer } =
    useContext(ConnectionContext);
  const { walletInfo } = useWalletInfo();

  useEffect(() => {
    const initConnection = async () => {
      if (!isConnected) return;
      let storedUserData = JSON.parse(localStorage.getItem("userAccount"));
      if (storedUserData && storedUserData?.account !== address) {
        handleDisconnect();
        return;
      }

      await handleConnect(storedUserData);
    };
    initConnection();
  }, [isConnected, address, chainId]);

  const handleConnect = async (storedUserData) => {
    try {
      if (!isConnected) await open();

      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();

      // Get network information
      const network = await ethersProvider.getNetwork();
      console.log("Connected Chain ID:", network.chainId.toString()); // Outputs "97"
      console.log("Connected Network Name:", network.name); // Outputs "bnbt"
      console.log("Gas Cost Plugin:", network.plugins[0]);

      
      // If there's no stored data or network mismatch, handle connection from scratch
      if (!storedUserData || storedUserData?.chainId !== chainId) {
        await signer.signMessage("Wellcome to Reown Appkit Wallet Boilerplate by Wajahat hussain.");

        const shortAddress = formatAddress(address);
        localStorage.removeItem("userAccount");

        saveUserData(address, chainId, shortAddress, signer, ethersProvider);

        if (isDilogOpen) await close();
      } else {
        setUserInfo(storedUserData);
        setSigner(signer);
      }
      navigate("/");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("userAccount");
    setSigner(null);
    setUserInfo(null);
    disconnect();
    console.log("Disconnected from wallet");
    navigate("/");
  };

  const formatAddress = (address) =>
    `${address.slice(0, 8)}...${address.slice(-6)}`;

  const saveUserData = (account, chainId, shortAddress, signer, provider) => {
    const userAccount = { account, chainId, shortAddress };
    localStorage.setItem("userAccount", JSON.stringify(userAccount));
    setUserInfo(userAccount);
    setSigner(signer);
  };

  return (
    <div className="button-container">
      {isConnected && signer ? (
        <>
          <button className="button x" onClick={() => open()}>
            <WalletIcon />
            {userInfo.shortAddress}
          </button>
          <button className="button x" onClick={handleDisconnect}>
            <ExitIcon />
          </button>
        </>
      ) : (
        <>
          <button className="button x" onClick={() => open()}>
            <WalletIcon />
            Connect Wallet
          </button>
          <button
            className="button x"
            onClick={() => open({ view: "Networks" })}
          >
            Open Network Modal
          </button>
        </>
      )}
    </div>
  );
};

const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 48 48"
  >
    <path fill="none" d="M0 0h48v48H0z" />
    <path d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
  </svg>
);

const ExitIcon = () => (
  <svg viewBox="0 0 512 512">
    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
  </svg>
);

export default WalletConnect;
