"use client";

import { Poppins } from "next/font/google";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { Provider as ChakraProvider } from "~~/components/ui/provider";
import { UPProvider } from "~~/contexts/UPProviderContext";
import { UniversalProfileProvider } from "~~/contexts/UniversalProfileContext";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const font = Poppins({ subsets: ["latin"], weight: "300" });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <html lang="en">
      <body className={font.className}>
        <ChakraProvider>
          {children}
          <Toaster />
        </ChakraProvider>
      </body>
    </html>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider avatar={BlockieAvatar} theme={lightTheme()}>
          <UPProvider>
            <UniversalProfileProvider>
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </UniversalProfileProvider>
          </UPProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
