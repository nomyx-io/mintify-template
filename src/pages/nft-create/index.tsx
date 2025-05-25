"use client";
import React, { useEffect, useState, useContext, useRef } from "react";

import { Button, Form } from "antd";
import { ethers } from "ethers";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import NftDetailsForm from "@/components/mint/NftDetailsForm";
import Compliance from "@/components/molecules/Compliance";
import { Industries } from "@/constants/constants";
import usePageUnloadGuard from "@/hooks/usePageUnloadGuard";
import { getDashboardLayout } from "@/Layouts";
import BlockchainService from "@/services/BlockchainService";
import { CarbonCreditService } from "@/services/CarbonCreditService";
import DfnsService from "@/services/DfnsService";
import ParseClient from "@/services/ParseClient";
import { TokenizedDebtService } from "@/services/TokenizedDebtService";
import { TradeFinanceService } from "@/services/TradeFinanceService";

import NftPreview from "../../components/mint/NftRecordDetail";
import { UserContext } from "../../context/UserContext";
import { WalletPreference } from "../../utils/constants";

const carbonCreditService = CarbonCreditService();
const tokenizedDebtService = TokenizedDebtService();
const tradeFinanceService = TradeFinanceService();

export default function Details({ service }: { service: BlockchainService }) {
  const { walletPreference, dfnsToken, user } = useContext(UserContext);
  const router = useRouter();
  const [form] = Form.useForm();

  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [industry, setIndustry] = useState<Industries | null>(null);

  const [isPageReady, setIsPageReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Use ref to prevent double initialization and track mount state
  const initializationRef = useRef(false);
  const mountedRef = useRef(true);

  const { address, isConnected } = useAccount();

  // Get blockchain service with better error handling
  const getBlockchainService = () => {
    try {
      if (walletPreference === WalletPreference.PRIVATE) {
        return BlockchainService.getInstance();
      }
      return service || BlockchainService.getInstance();
    } catch (error) {
      console.warn("Error getting blockchain service:", error);
      return null;
    }
  };

  const blockchainService = getBlockchainService();

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main initialization effect
  useEffect(() => {
    // Prevent double initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializePage = async () => {
      try {
        // Check if we're still mounted
        if (!mountedRef.current) return;

        // Reset any previous errors
        setInitializationError(null);

        // For production environments, add a small delay to ensure all contexts are loaded
        if (process.env.NODE_ENV === "production") {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Step 1: Validate environment
        const requiredEnvVars = {
          parseServerUrl: process.env.NEXT_PUBLIC_PARSE_SERVER_URL,
          chainId: process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID,
        };

        const missingVars = Object.entries(requiredEnvVars)
          .filter(([key, value]) => !value)
          .map(([key]) => `NEXT_PUBLIC_${key.toUpperCase()}`);

        if (missingVars.length > 0) {
          throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
        }

        // Step 2: Wait for complete user context
        const maxWaitTime = process.env.NODE_ENV === "production" ? 10000 : 5000; // Longer timeout for production
        const pollInterval = 100;
        const maxAttempts = maxWaitTime / pollInterval;
        let attempts = 0;

        while (attempts < maxAttempts && mountedRef.current) {
          // Check for session token
          let sessionToken = null;
          try {
            sessionToken = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
          } catch (e) {
            console.warn("LocalStorage access error:", e);
            break; // If we can't access localStorage, something is seriously wrong
          }

          // All required context data must be present
          const hasCompleteContext = user && sessionToken && walletPreference !== null && walletPreference !== undefined;

          if (hasCompleteContext) {
            console.log(`Complete user context loaded after ${attempts * pollInterval}ms`);
            break;
          }

          // Log progress every second in production
          if (process.env.NODE_ENV === "production" && attempts % 10 === 0 && attempts > 0) {
            console.log(`Still waiting for context... (${attempts * pollInterval}ms elapsed)`);
          }

          attempts++;
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        // Verify we have everything we need
        if (!mountedRef.current) return;

        const sessionToken = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;

        if (!user || !sessionToken) {
          console.warn("User authentication failed");
          router.push("/login");
          return;
        }

        if (walletPreference === null || walletPreference === undefined) {
          throw new Error("Wallet preference not set. Please complete your profile setup.");
        }

        // Step 3: Initialize services
        if (walletPreference === WalletPreference.PRIVATE) {
          // For private wallets, ensure Web3 provider is available
          if (typeof window !== "undefined" && window.ethereum) {
            // Give provider extra time to initialize in production
            const providerDelay = process.env.NODE_ENV === "production" ? 500 : 200;
            await new Promise((resolve) => setTimeout(resolve, providerDelay));
          }
        }

        // Step 4: Verify blockchain service
        const currentBlockchainService = getBlockchainService();
        if (!currentBlockchainService && walletPreference === WalletPreference.PRIVATE) {
          console.warn("⚠️ Blockchain service not available, but continuing...");
        }

        // All checks passed
        if (mountedRef.current) {
          console.log("Page ready for use");
          setIsPageReady(true);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Page initialization failed:", errorMessage);

        if (mountedRef.current) {
          setInitializationError(errorMessage);
        }
      }
    };

    initializePage();

    // Cleanup function
    return () => {
      // Don't reset initializationRef here to prevent re-running
    };
  }, [user, walletPreference, router, service]);

  const listener = usePageUnloadGuard();
  useEffect(() => {
    listener.onBeforeUnload = () => true;
    return () => {
      listener.onBeforeUnload = () => true;
    };
  }, [listener]);

  const handlePreview = (values: any) => {
    setFormData(values);
    setIndustry(values.industryTemplate as Industries);
    setPreview(true);
  };

  const handleBack = () => {
    setPreview(false);
  };

  const generateMetadata = (values: Record<string, any>): Metadata[] => {
    const metadataFields: Metadata[] = [];
    Object.entries(values).forEach(([key, value]) => {
      if (value || value === 0) {
        metadataFields.push({ key, attributeType: 1, value });
      }
    });
    metadataFields.push({
      key: "claimTopics",
      attributeType: 0,
      value: selectedClaims.join(","),
    });
    return metadataFields;
  };

  const resetFormStates = () => {
    form.resetFields();
    setSelectedClaims([]);
    setPreview(false);
  };

  const handleMint = async () => {
    try {
      // Double-check blockchain service availability
      const currentBlockchainService = getBlockchainService();
      if (!currentBlockchainService && walletPreference === WalletPreference.PRIVATE) {
        throw new Error("Blockchain service is not available. Please refresh the page and ensure your wallet is connected.");
      }

      const tradeDealId = formData._tradeDealId;
      if (industry === Industries.TRADE_FINANCE && formData.totalAmount) {
        const parsed = parseFloat(formData.totalAmount);
        if (!isNaN(parsed)) formData.totalAmount = (parsed * 1_000_000).toFixed(0);
      }

      delete formData._tradeDealId;
      delete formData.industryTemplate;
      delete formData.tradeAmount;

      const nftMetadata = generateMetadata(formData);
      const mintAddress = nftMetadata.find((v) => v.key === "mintAddress")?.value;
      if (!mintAddress) return toast.error("Wallet address is not available.");

      const walletId = user?.walletId || null;
      const safeDfnsToken = dfnsToken ?? "";

      if (walletPreference === WalletPreference.MANAGED && (!walletId || !dfnsToken)) {
        throw new Error("Missing wallet credentials for DFNS transactions.");
      }

      const mintingToast = toast.loading("Minting token...");
      let tokenId, transactionHash;
      const tokenUrlFields: { [key: string]: string } = {};

      if (walletPreference === WalletPreference.PRIVATE) {
        const result = await currentBlockchainService?.gemforceMint(nftMetadata);
        if (!result) {
          throw new Error("Failed to mint: gemforceMint returned undefined");
        }
        ({ tokenId, transactionHash } = result);
      } else {
        const modifiedNftMetadata = nftMetadata.filter((item) => {
          if (typeof item.value === "string" && item.value.match(/^(http:\/\/|ipfs:\/\/)[^\s]+$/)) {
            tokenUrlFields[item.key] = item.value;
            return false;
          }
          return true;
        });
        const response = await DfnsService.dfnsGemforceMint(walletId, safeDfnsToken, modifiedNftMetadata);
        if (!response.completeResponse) throw new Error("DFNS minting did not return a valid response.");
        ({ tokenId, transactionHash } = response.completeResponse);
      }

      toast.update(mintingToast, {
        render: `✅ Token minted successfully. TX Hash: ${transactionHash}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      await new Promise((r) => setTimeout(r, 2000));

      switch (industry) {
        case Industries.CARBON_CREDIT:
          const ccToast = toast.loading("Initializing carbon credits...");
          try {
            if (walletPreference === WalletPreference.PRIVATE) {
              await carbonCreditService.initializeCarbonCredit(tokenId, formData.existingCredits || "0");
            } else {
              await DfnsService.dfnsInitializeCarbonCredit(walletId, safeDfnsToken, tokenId, formData.existingCredits || "0");
            }
            toast.update(ccToast, {
              render: `✅ Carbon credits initialized for token ID: ${tokenId}`,
              type: "success",
              isLoading: false,
              autoClose: 5000,
            });
          } catch (err) {
            toast.update(ccToast, {
              render: `Error initializing carbon credits: ${err}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
          }
          break;

        case Industries.TRADE_FINANCE:
          if (typeof tradeDealId !== "number") {
            return toast.error("Trade deal ID is required for trade finance tokens");
          }
          const depositToast = toast.loading("Depositing Stock into Fund pool...");
          try {
            if (walletPreference === WalletPreference.PRIVATE) {
              await currentBlockchainService?.tdDepositInvoice(tradeDealId, tokenId);
            } else {
              const depositResult = await DfnsService.dfnsTdDepositInvoice(walletId, safeDfnsToken, tradeDealId, tokenId);
              if (depositResult.error) throw new Error(depositResult.error);
            }
            toast.update(depositToast, {
              render: `Invoice successfully deposited to trade deal ${tradeDealId}`,
              type: "success",
              isLoading: false,
              autoClose: 5000,
            });
          } catch (err) {
            toast.update(depositToast, {
              render: `Error depositing stock: ${err}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
            throw err;
          }

          if (Object.keys(tokenUrlFields).length > 0) {
            for (let i = 1; i <= 3; i++) {
              try {
                const result = await ParseClient.updateTokenUrls(tokenId, tokenUrlFields);
                if (result) break;
                await new Promise((r) => setTimeout(r, 2000));
              } catch (err) {
                if (i === 3) console.error(`Failed to update token URLs after ${i} attempts`);
              }
            }
          }
          break;
      }

      if (industry !== Industries.TRADE_FINANCE) {
        await new Promise((r) => setTimeout(r, 2000));
        const price = nftMetadata.find((v) => v.key === "price")?.value || "0";
        const usdcPrice = ethers.parseUnits(price, 6);
        const listingToast = toast.loading("Listing token on the marketplace...");
        try {
          if (walletPreference === WalletPreference.PRIVATE) {
            await currentBlockchainService?.listItem(mintAddress, tokenId, usdcPrice, true);
          } else {
            const listingRes = await DfnsService.dfnsListItem(walletId, safeDfnsToken, mintAddress, tokenId, price, true);
            if (listingRes?.error) throw new Error(listingRes.error);
          }
          toast.update(listingToast, {
            render: `Token successfully listed with ID: ${tokenId}`,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
        } catch (err) {
          toast.update(listingToast, {
            render: `Error during listing: ${err}`,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      }

      resetFormStates();
      toast.success(
        industry === Industries.TRADE_FINANCE
          ? `Successfully minted NFT with Token ID: ${tokenId}`
          : `Successfully minted and listed NFT with Token ID: ${tokenId}`
      );
      return tokenId;
    } catch (e) {
      toast.dismiss();
      toast.error(e instanceof Error ? e.message : String(e));
      console.error("Error:", e);
    }
  };

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-red-500 mb-4">{initializationError}</div>
        <div className="space-y-2">
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          <div className="text-sm text-gray-500">If this persists, try logging out and back in.</div>
        </div>
      </div>
    );
  }

  // Show loading state while page is initializing
  if (!isPageReady) {
    return (
      <div className="w-full text-center py-8">
        <div className="mb-2">Loading user data...</div>
        <div className="text-sm text-gray-500">
          {process.env.NODE_ENV === "production" ? "Initializing services..." : "Setting up development environment..."}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mint Tokens - Nomyx Mintify</title>
      </Head>
      {preview ? (
        <NftPreview data={{ ...formData, claimTopics: selectedClaims.join(",") }} handleBack={handleBack} handleMint={handleMint} />
      ) : (
        <div className="w-full flex flex-col gap-3">
          <NftDetailsForm form={form} onFinish={handlePreview} />
          <Compliance selectedClaims={selectedClaims} setSelectedClaims={setSelectedClaims} />
          <div className="actions flex gap-3">
            <Button className="text-black bg-white hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark" onClick={() => router.push("/home")}>
              Cancel
            </Button>
            <Button
              className="text-black bg-white hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark border border-gray-300"
              onClick={form.submit}
            >
              Preview
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

Details.getLayout = getDashboardLayout;
