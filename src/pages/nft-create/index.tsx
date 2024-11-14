"use client";
import React, { useEffect, useState } from "react";
import NftPreview from "../../components/mint/NftRecordDetail";
import { getDashboardLayout } from "@/Layouts";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { Button, Form } from "antd";
import { usePageUnloadGuard } from "@/hooks/usePageUnloadGuard";
import BlockchainService from "@/services/BlockchainService";
import { ethers } from "ethers";
import NftDetailsForm from "@/components/mint/NftDetailsForm";
import Compliance from "@/components/molecules/Compliance";

export default function Details({ service }: { service: BlockchainService }) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [form] = Form.useForm();

  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [additionalFunctions, setAdditionalFunctions] = useState<any[]>([]);

  const listener = usePageUnloadGuard();
  listener.onBeforeUnload = () => {
    return true;
  };

  useEffect(() => {
    !isConnected && router.push("/login");
  }, [isConnected, router]);

  const handleFunctionsChange = (functions: any[]) => {
    setAdditionalFunctions(functions);
  };

  const handlePreview = (values: any) => {
    setFormData(values);
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
    const nftMetadata = generateMetadata(formData);
    const mintAddress = nftMetadata.find(
      (value) => value.key === "mintAddress"
    )?.value;
    if (!mintAddress) {
      toast.error("Wallet address is not available.");
      return;
    }

    try {
      const mintingToast = toast.loading("Minting token...");
      const { tokenId, transactionHash } = await service.gemforceMint(
        nftMetadata
      );
      toast.update(mintingToast, {
        render: `Token minted successfully. Transaction Hash: ${transactionHash}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      //initiate carbon credit
      if (additionalFunctions) {
        const carbonCreditFunction = additionalFunctions.some(
          (t) => t.name.replace("_", "").toLowerCase() === "carboncredit"
        );
        if (carbonCreditFunction) {
          const carbonCredit = nftMetadata.find(
            (value) =>
              value.key.replace("_", "").toLowerCase() === "carboncredit"
          )?.value;

          if (carbonCredit) {
            await initializeCarbonCredit(tokenId, carbonCredit);
          }
        }
      }

      const price =
        nftMetadata.find((value) => value.key === "price")?.value || "0";
      console.log(price);
      const usdcPrice = ethers.parseUnits(price, 6);
      toast.info(`Calculated total price in USDC: ${price || "0"}`, {
        autoClose: 3000,
      });

      const listingToast = toast.loading("Listing token on the marketplace...");
      await service.listItem(
        mintAddress, // Receiver of the sale funds
        tokenId, // Token ID of the NFT
        usdcPrice, // Price in wei (USDC with 6 decimals)
        true // Transfer the NFT to the marketplace
      );
      toast.update(listingToast, {
        render: `Token successfully listed with ID: ${tokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      resetFormStates();

      toast.success(
        `Successfully minted NFT with Token ID: ${tokenId} and listed on the marketplace.`
      );
      return tokenId;
    } catch (e) {
      let errorMessage =
        "An error occurred during the minting/listing process.";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }
      console.error(e);
      toast.dismiss();
      toast.error(errorMessage);
    }
  };

  const initializeCarbonCredit = async (tokenId: any, existingCredits: any) => {
    const carbonCreditToast = toast.loading("Initializing carbon credits...");
    await service.initializeCarbonCredit(tokenId, existingCredits || "0");
    toast.update(carbonCreditToast, {
      render: `Carbon credits initialized for token ID: ${tokenId}`,
      type: "success",
      isLoading: false,
      autoClose: 5000,
    });
  };

  const resetFormStates = () => {
    form.resetFields();
    setSelectedClaims([]);
    setPreview(false);
  };

  return (
    <>
      {preview ? (
        <NftPreview
          data={{ ...formData, claimTopics: selectedClaims.join(",") }}
          handleBack={handleBack}
          handleMint={handleMint}
        />
      ) : (
        <div className="w-full flex flex-col gap-3">
          <NftDetailsForm
            form={form}
            onFinish={handlePreview}
            onFunctionsUpdate={handleFunctionsChange}
          />
          <Compliance
            selectedClaims={selectedClaims}
            setSelectedClaims={setSelectedClaims}
          />

          <div className="actions flex gap-3">
            <Button
              className="text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent"
              onClick={() => router.push("/home")}
            >
              Cancel
            </Button>
            <Button
              className="text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent"
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
