"use client";
import React, { useEffect, useState, useContext } from "react";

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

  const [isUserChecked, setIsUserChecked] = useState(false);

  const { address, isConnected } = useAccount();
  const [isProviderReady, setIsProviderReady] = useState(false);

  const blockchainService = walletPreference === WalletPreference.PRIVATE ? BlockchainService.getInstance() : service;

  useEffect(() => {
    const checkUserInterval = setInterval(() => {
      const token = localStorage.getItem("sessionToken");

      if (user && token) {
        console.log("User and token found, continuing...");
        clearInterval(checkUserInterval);
        clearTimeout(timeout); // clear the timeout in case polling resolves first
        setIsUserChecked(true);
      }
    }, 200);

    // Safety: timeout after 5 seconds to avoid infinite loop
    const timeout = setTimeout(() => {
      clearInterval(checkUserInterval);

      if (!user) {
        console.warn("User context not available after timeout. Redirecting to login...");
        router.push("/login");
      } else {
        console.log("Proceeding after timeout with available user context.");
        setIsUserChecked(true);
      }
    }, 5000);

    return () => {
      clearInterval(checkUserInterval);
      clearTimeout(timeout);
    };
  }, [user, router]);

  useEffect(() => {
    // Check if the provider is available
    const checkProvider = async () => {
      try {
        // Small delay to ensure provider has time to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Set provider as ready
        setIsProviderReady(true);
      } catch (error) {
        console.error("Error initializing Web3 provider:", error);
      }
    };

    checkProvider();
  }, []);

  const listener = usePageUnloadGuard();
  useEffect(() => {
    listener.onBeforeUnload = () => true;
    return () => {
      listener.onBeforeUnload = () => true; // or () => false
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
        const result = await blockchainService?.gemforceMint(nftMetadata);
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
              await blockchainService?.tdDepositInvoice(tradeDealId, tokenId);
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
            await blockchainService?.listItem(mintAddress, tokenId, usdcPrice, true);
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

  if (!isUserChecked) return <div className="w-full text-center py-8">Loading user data...</div>;

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
              className="bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark border border-gray-300"
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
