import { WebAuthnSigner } from "@dfns/sdk-browser";
import Parse from "parse";

class DfnsService {
  private static _instance: DfnsService;

  private usdcAddress: string = process.env.NEXT_PUBLIC_HARDHAT_USDC_ADDRESS ?? "";

  public static get instance(): DfnsService {
    if (!DfnsService._instance) {
      DfnsService._instance = new DfnsService();
    }
    return DfnsService._instance;
  }

  public async getInitialState() {}

  public async dfnsGemforceMint(walletId: string, dfnsToken: string, metadata: any) {
    if (!walletId || !dfnsToken || !metadata) {
      throw new Error("Missing required parameters for minting.");
    }

    try {
      // Step 1: Initiate minting
      const initiateResponse = await Parse.Cloud.run("dfnsGemforceMintInit", {
        walletId,
        dfns_token: dfnsToken,
        metadata,
      });
      console.log("Pending mint request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete minting
      const completeResponse = await Parse.Cloud.run("dfnsGemforceMintComplete", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error minting:", error);
      return { completeResponse: null, error: error.message };
    }
  }

  /**
   * Approves USDC before depositing (decoupled)
   */
  public async dfnsApproveUSDC(walletId: string, dfnsToken: string, price: string) {
    if (!walletId || !dfnsToken || !price) {
      throw new Error("Missing required parameters for USDC approval.");
    }

    try {
      // Step 1: Initiate USDC approval
      const initiateResponse = await Parse.Cloud.run("dfnsInitTreasuryApproval", {
        walletId,
        dfns_token: dfnsToken,
        price,
      });

      console.log("Pending USDC approval request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete USDC approval
      const completeResponse = await Parse.Cloud.run("dfnsCompleteApproval", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error approving USDC:", error);
      return { completeResponse: null, error: error.message };
    }
  }

  /**
   * Deposits funds after approval
   */
  public async dfnsDeposit(walletId: string, dfnsToken: string, depositData: any) {
    if (!walletId || !dfnsToken || !depositData || !Array.isArray(depositData)) {
      throw new Error("Missing required parameters for deposit or invalid format.");
    }

    try {
      // Step 1: Initiate deposit (no approval here, already handled separately)
      const initiateResponse = await Parse.Cloud.run("dfnsInitDeposit", {
        walletId,
        dfns_token: dfnsToken,
        deposits: depositData,
      });

      console.log("Pending deposit request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete deposit
      const completeResponse = await Parse.Cloud.run("dfnsCompleteDeposit", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error depositing:", error);
      return { completeResponse: null, error: error.message };
    }
  }

  public async dfnsListItem(walletId: string, dfnsToken: string, receiver: string, tokenId: number, price: string, transferNFT: boolean) {
    if (!walletId || !dfnsToken || !receiver || !tokenId || !price) {
      throw new Error("Missing required parameters for listing.");
    }

    try {
      // Step 1: Initiate listing
      const initiateResponse = await Parse.Cloud.run("dfnsInitListItem", {
        walletId,
        dfns_token: dfnsToken,
        receiver,
        tokenId,
        price,
        transferNFT,
        paymentToken: this.usdcAddress,
      });
      console.log("Pending list request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete listing
      const completeResponse = await Parse.Cloud.run("dfnsCompleteListItem", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error listing item:", error);
      return { completeResponse: null, error: error.message };
    }
  }

  public async dfnsDelistItem(walletId: string, dfnsToken: string, tokenId: number) {
    if (!walletId || !dfnsToken || !tokenId) {
      throw new Error("Missing required parameters for delisting.");
    }

    try {
      // Step 1: Initiate delisting
      const initiateResponse = await Parse.Cloud.run("dfnsInitDelistItem", {
        walletId,
        dfns_token: dfnsToken,
        tokenId,
      });
      console.log("Pending delist request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete delisting
      const completeResponse = await Parse.Cloud.run("dfnsCompleteDelistItem", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error delisting item:", error);
      return { completeResponse: null, error: error.message };
    }
  }

  public async dfnsInitializeCarbonCredit(walletId: string, dfnsToken: string, tokenId: number, initialBalance: string) {
    if (!walletId || !dfnsToken || !tokenId || !initialBalance) {
      throw new Error("Missing required parameters for initializing carbon credit.");
    }

    try {
      // Step 1: Initiate carbon credit initialization
      const initiateResponse = await Parse.Cloud.run("dfnsInitInitializeCarbonCredit", {
        walletId,
        dfns_token: dfnsToken,
        tokenId,
        initialBalance,
      });
      console.log("Pending carbon credit initialization request:", initiateResponse);

      // Step 2: Sign the challenge
      const webauthn = new WebAuthnSigner();
      const assertion = await webauthn.sign(initiateResponse.challenge);

      // Step 3: Complete carbon credit initialization
      const completeResponse = await Parse.Cloud.run("dfnsCompleteInitializeCarbonCredit", {
        walletId,
        dfns_token: dfnsToken,
        signedChallenge: {
          challengeIdentifier: initiateResponse.challenge.challengeIdentifier,
          firstFactor: assertion,
        },
        requestBody: initiateResponse.requestBody,
      });

      return { completeResponse, error: null };
    } catch (error: any) {
      console.error("Error initializing carbon credit:", error);
      return { completeResponse: null, error: error.message };
    }
  }
}

export default DfnsService.instance;
