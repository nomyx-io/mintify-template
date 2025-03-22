"use client";
import React, { useEffect, useState, useContext } from "react";

import { Button, Form } from "antd";
import { ethers } from "ethers";
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
  const blockchainService = BlockchainService.getInstance();

  const listener = usePageUnloadGuard();
  listener.onBeforeUnload = () => {
    return true;
  };

  useEffect(() => {
    !user && router.push("/login");
  }, [user, router]);

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
        const metadataField = {
          key,
          attributeType: 1,
          value,
        };

        metadataFields.push(metadataField);
      }
    });
    const claimsTopics = {
      key: "claimTopics",
      attributeType: 0,
      value: selectedClaims ? selectedClaims.join(",") : selectedClaims,
    };

    metadataFields.push(claimsTopics);
    return metadataFields;
  };

  const handleMint = async () => {
    if (!blockchainService) {
      toast.error("Blockchain service is not available.");
      return;
    }

    const nftMetadata = generateMetadata(formData);
    const mintAddress = nftMetadata.find((value) => value.key === "mintAddress")?.value;

    if (!mintAddress) {
      toast.error("Wallet address is not available.");
      return;
    }

    const walletId = user?.walletId || null;
    let safeDfnsToken = dfnsToken ?? "";

    try {
      console.log("🔹 DFNS Token Before Minting:", safeDfnsToken);
      console.log("🔹 Wallet ID Before Minting:", walletId);

      if (walletPreference === WalletPreference.MANAGED && (!walletId || !dfnsToken)) {
        throw new Error("Missing wallet credentials for DFNS transactions.");
      }

      // Start minting process
      const mintingToast = toast.loading("Minting token...");
      let tokenId, transactionHash;

      if (walletPreference === WalletPreference.PRIVATE) {
        // **PRIVATE WALLET: Use BlockchainService**
        ({ tokenId, transactionHash } = await blockchainService.gemforceMint(nftMetadata));
      } else {
        // **MANAGED WALLET: Use DFNS Service**
        const response = await DfnsService.dfnsGemforceMint(walletId, safeDfnsToken, nftMetadata);
        console.log("✅ DFNS Mint Complete Response:", response);

        if (response.completeResponse) {
          tokenId = response.completeResponse.tokenId;
          transactionHash = response.completeResponse.transactionHash;
        } else {
          throw new Error("DFNS minting did not return a valid response.");
        }
      }

      toast.update(mintingToast, {
        render: `✅ Token minted successfully. TX Hash: ${transactionHash}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // **Introduce a short delay to allow blockchain to settle**
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // **Handle Industry-Specific Logic**
      switch (industry) {
        case Industries.CARBON_CREDIT:
          const carbonCreditToast = toast.loading("Initializing carbon credits...");
          try {
            if (walletPreference === WalletPreference.PRIVATE) {
              await carbonCreditService.initializeCarbonCredit(tokenId, formData?.existingCredits || "0");
            } else {
              await DfnsService.dfnsInitializeCarbonCredit(walletId, safeDfnsToken, tokenId, formData?.existingCredits || "0");
            }
            toast.update(carbonCreditToast, {
              render: `✅ Carbon credits initialized for token ID: ${tokenId}`,
              type: "success",
              isLoading: false,
              autoClose: 5000,
            });
          } catch (error) {
            toast.update(carbonCreditToast, {
              render: `❌ Error initializing carbon credits: ${error}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
          }
          break;

        case Industries.TOKENIZED_DEBT:
          break;

        case Industries.TRADE_FINANCE:
          // Get tradeDealId directly from the formData
          const tradeDealId = formData.tradeDealId;

          if (!tradeDealId) {
            toast.error("Trade deal ID is required for trade finance tokens");
            break;
          }

          const depositToast = toast.loading("Depositing invoice to trade deal...");
          try {
            if (walletPreference === WalletPreference.PRIVATE) {
              await blockchainService.tdDepositInvoice(parseInt(tradeDealId), tokenId);
            } else {
              const depositResult = await DfnsService.dfnsTdDepositInvoice(walletId, safeDfnsToken, parseInt(tradeDealId), tokenId);
              if (depositResult.error) {
                throw new Error(depositResult.error);
              }
            }
            toast.update(depositToast, {
              render: `✅ Invoice successfully deposited to trade deal ${tradeDealId}`,
              type: "success",
              isLoading: false,
              autoClose: 5000,
            });
          } catch (error) {
            toast.update(depositToast, {
              render: `❌ Error depositing invoice: ${error}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
            throw error;
          }
          break;

        default:
          break;
      }

      // Skip listing for trade finance projects
      if (industry !== Industries.TRADE_FINANCE) {
        // **Introduce another short delay before listing**
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // **Proceed with Listing**
        const price = nftMetadata.find((value) => value.key === "price")?.value || "0";
        const usdcPrice = ethers.parseUnits(price, 6);
        toast.info(`ℹ️ Calculated total price in USDC: ${price || "0"}`, { autoClose: 3000 });

        const listingToast = toast.loading("Listing token on the marketplace...");

        let listingResponse;
        try {
          if (walletPreference === WalletPreference.PRIVATE) {
            await blockchainService.listItem(mintAddress, tokenId, usdcPrice, true);
          } else {
            listingResponse = await DfnsService.dfnsListItem(walletId, safeDfnsToken, mintAddress, tokenId, price, true);
          }

          console.log("✅ DFNS Listing Response:", listingResponse);

          if (listingResponse?.error) {
            throw new Error(`DFNS Listing Error: ${listingResponse.error}`);
          }

          toast.update(listingToast, {
            render: `✅ Token successfully listed with ID: ${tokenId}`,
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });

          // **Introduce a final short delay after listing**
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          toast.update(listingToast, {
            render: `❌ Error during listing: ${error}`,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          throw error;
        }
      }

      resetFormStates();
      const successMessage =
        industry === Industries.TRADE_FINANCE
          ? `🎉 Successfully minted NFT with Token ID: ${tokenId}`
          : `🎉 Successfully minted and listed NFT with Token ID: ${tokenId}`;
      toast.success(successMessage);
      return tokenId;
    } catch (e) {
      let errorMessage = "An error occurred during the minting/listing process.";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }
      console.error("❌ Error:", e);
      toast.dismiss();
      toast.error(errorMessage);
    }
  };

  const resetFormStates = () => {
    form.resetFields();
    setSelectedClaims([]);
    setPreview(false);
  };

  return (
    <>
      {preview ? (
        <NftPreview data={{ ...formData, claimTopics: selectedClaims.join(",") }} handleBack={handleBack} handleMint={handleMint} />
      ) : (
        <div className="w-full flex flex-col gap-3">
          <NftDetailsForm form={form} onFinish={handlePreview} />
          <Compliance selectedClaims={selectedClaims} setSelectedClaims={setSelectedClaims} />

          <div className="actions flex gap-3">
            <Button className="text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent" onClick={() => router.push("/home")}>
              Cancel
            </Button>
            <Button className="text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent" onClick={form.submit}>
              Preview
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
Details.getLayout = getDashboardLayout;
