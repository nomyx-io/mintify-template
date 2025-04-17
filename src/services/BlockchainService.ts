import { parseEther, ethers, parseUnits } from "ethers";

import ParseClient from "./ParseClient";
import CarbonCreditRegistry from "../abi/ICarbonCreditFacet.json";
import GFMintedRegistry from "../abi/IGemForceMinterFacet.json";
import MarketplaceRegistry from "../abi/IMarketplaceFacet.json";
import TradeDealRegistry from "../abi/ITradeDealFacet.json";
import TreasuryRegistry from "../abi/ITreasury.json";
import USDCRegistry from "../abi/USDC.json";

export default class BlockchainService {
  private gfMintedAbi = GFMintedRegistry.abi;
  private treasuryAbi = TreasuryRegistry.abi;
  private usdcAbi = USDCRegistry.abi;
  private marketplaceAbi = MarketplaceRegistry.abi;
  private carbonCreditAbi = CarbonCreditRegistry.abi;
  private tradeDealAbi = TradeDealRegistry.abi;
  private parseClient = ParseClient;
  private provider: ethers.BrowserProvider;
  private dedicatedProvider: ethers.JsonRpcProvider | null = null;
  // private signer: ethers.JsonRpcSigner|undefined;
  private signer: any;
  private gfMintService: ethers.Contract | undefined;
  private treasuryService: ethers.Contract | undefined;
  private usdcService: ethers.Contract | undefined;
  private marketplaceService: ethers.Contract | undefined;
  private carbonCreditService: ethers.Contract | undefined;
  private tradeDealService: ethers.Contract | undefined;

  private contractAddress: any;
  private treasuryAddress: any;
  private usdcAddress: any;

  private static instance: BlockchainService;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */

  constructor() {
    let ethObject = (window as any).ethereum;
    this.provider = new ethers.BrowserProvider(ethObject);
    this.provider.getSigner().then((signer) => (this.signer = signer));

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (rpcUrl) {
      this.dedicatedProvider = new ethers.JsonRpcProvider(rpcUrl);
      console.log("Using dedicated RPC provider:", rpcUrl);
    }

    this.gemforceMint = this.gemforceMint.bind(this);
    this.getClaimTopics = this.getClaimTopics.bind(this);

    this.parseClient.initialize();

    this.init();
  }

  private async init() {
    const network = await this.dedicatedProvider?.getNetwork();
    const chainId: any = network?.chainId;

    const chainConfig = process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID;

    if (network && (!chainConfig || chainConfig != chainId)) {
      throw new Error(`No chain config found for chainId: ${chainId}, chainConfig: ${chainConfig}`);
    }

    this.contractAddress = process.env.NEXT_PUBLIC_HARDHAT_CONTRACT_ADDRESS;
    this.treasuryAddress = process.env.NEXT_PUBLIC_HARDHAT_TREASURY_ADDRESS;
    this.usdcAddress = process.env.NEXT_PUBLIC_HARDHAT_USDC_ADDRESS;

    this.gfMintService = new ethers.Contract(this.contractAddress, this.gfMintedAbi, this.provider);
    this.treasuryService = new ethers.Contract(this.treasuryAddress, this.treasuryAbi, this.provider);
    this.usdcService = new ethers.Contract(this.usdcAddress, this.usdcAbi, this.provider);
    this.marketplaceService = new ethers.Contract(this.contractAddress, this.marketplaceAbi, this.provider);
    this.carbonCreditService = new ethers.Contract(this.contractAddress, this.carbonCreditAbi, this.provider);
    this.tradeDealService = new ethers.Contract(this.contractAddress, this.tradeDealAbi, this.provider);
  }

  async getClaimTopics(): Promise<Parse.Object[] | undefined> {
    return await this.parseClient.getRecords("ClaimTopic", [], [], ["*"]);
  }

  async gemforceMint(metaData: any): Promise<{ tokenId: number; transactionHash: string }> {
    const retryDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchParseRecord = async (transactionHash: string, attempts: number): Promise<any> => {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const parseRecord = await ParseClient.getRecords("Token", ["transactionHash"], [transactionHash], ["*"]);

        if (parseRecord && parseRecord.length > 0) {
          return parseRecord;
        }

        console.log(`Attempt ${attempt} failed. Retrying in 5 seconds...`);
        await retryDelay(5000); // Wait for 5 seconds before retrying
      }

      throw new Error("Parse record not found for the given transaction hash after multiple attempts.");
    };

    try {
      if (this.signer) {
        // Get the contract instance with the signer
        const contractWithSigner: any = this.gfMintService?.connect(this.signer);

        // Send the transaction and get the transaction object immediately
        const tx = await contractWithSigner.gemforceMint(metaData);
        const transactionHash = tx.hash; // Get the transaction hash here, not from the receipt

        // Wait for the transaction to be mined and get the receipt
        const receipt = await tx.wait();

        // Retry fetching the Parse record up to 3 times, with a 5-second delay between each
        const parseRecord = await fetchParseRecord(transactionHash, 3);

        // Retrieve the tokenId from the parseRecord
        const tokenId = parseRecord[0]?.attributes?.tokenId;

        return { tokenId, transactionHash };
      } else {
        throw new Error("Signer is not available.");
      }
    } catch (e) {
      console.error("Error in gemforceMint:", e);
      throw e; // Re-throw the error after logging it
    }
  }

  async deposit(depositData: any) {
    try {
      const totalAmount = depositData.reduce((accumulator: any, depositEntry: any) => (accumulator += parseInt(depositEntry.amount)), 0);
      const usdcContractWithSinger: any = this.usdcService?.connect(this.signer);
      //const parsedTotalAmount =   parseEther(totalAmount.toString());
      const parsedTotalAmount = parseUnits(totalAmount.toString(), 6); // Assuming 6 decimal places for USDC
      let tx = await usdcContractWithSinger.approve(this.treasuryAddress, parsedTotalAmount);
      await tx.wait();

      const contractWithSigner: any = this.treasuryService?.connect(this.signer);
      const contractRequestBody = depositData.map((deposit: any) => [deposit.tokenId, parseUnits(String(deposit.amount), 6)]);
      tx = await contractWithSigner.deposit(contractRequestBody);
      return await tx.wait();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async listItem(
    receiver: string, // Address that will receive the funds
    tokenId: number, // The token ID of the NFT to list
    price: bigint, // The price of the NFT in wei
    transferNFT: boolean // Whether to transfer the NFT to the marketplace
  ) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.marketplaceService?.connect(this.signer);
      const tx = await contractWithSigner.listItem(
        this.contractAddress, // Hardcoded NFT contract address
        receiver, // Address that will receive payment
        tokenId, // Token ID of the NFT
        price, // Price in wei
        transferNFT, // Transfer the NFT or not
        this.usdcAddress
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.log("Error in listItem:", e);
      throw e;
    }
  }

  async delistItem(tokenId: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }
      console.log("tokenId: ", tokenId);
      console.log("contract address: ", this.contractAddress);
      console.log("this.signer.address", this.signer.address);
      const contractWithSigner: any = this.marketplaceService?.connect(this.signer);
      const tx = await contractWithSigner.delistItem(this.contractAddress, tokenId);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.log("Error in delistItem:", e);
      throw e;
    }
  }

  /// @notice fetch all the items listed in the marketplace
  /// @return MarketItem[] memory array of all the items listed in the marketplace
  async fetchItems() {
    try {
      if (!this.dedicatedProvider) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.marketplaceService?.connect(this.dedicatedProvider);
      const items = await contractWithSigner?.fetchItems();
      console.log("items: ", items);
      return items;
    } catch (e) {
      console.log("Error in fetchItems:", e);
      throw e;
    }
  }

  async activateTradeDeal(tradeDealId: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);

      // Send the transaction
      const tx = await contractWithSigner.activateTradeDeal(tradeDealId);

      // Wait for the transaction to be mined and return the receipt
      return await tx.wait();
    } catch (e) {
      console.error("Error in activateTradeDeal:", e);
      throw e;
    }
  }

  async createTradeDeal(
    name: string,
    symbol: string,
    interestRate: number,
    vabbToVabiRatio: number,
    requiredClaimTopics: number[],
    vabbAddress: string,
    vabiAddress: string,
    usdcAddress: string
  ) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);

      // Send the transaction
      const tx = await contractWithSigner.createTradeDeal(
        name,
        symbol,
        interestRate,
        vabbToVabiRatio,
        requiredClaimTopics,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        usdcAddress
      );

      console.log("🚀 Transaction sent. TX Hash:", tx.hash);

      // Wait for transaction receipt
      // Wait for transaction receipt
      const receipt = await tx.wait();

      console.log("🔍 Full Transaction Receipt:", receipt);
      console.log("🔍 Logs:", receipt.logs);

      const tradeDealEvent = receipt.logs.find((log: any, index: any) => log.topics.length >= 2 && index === 2);

      if (!tradeDealEvent) {
        throw new Error("TradeDealCreated event not found in logs.");
      }

      console.log("📜 Trade Deal Event Topics:", tradeDealEvent.topics);

      // Extract tradeDealId from topics[1]
      const tradeDealId = parseInt(tradeDealEvent.topics[1], 16);

      console.log("Extracted Trade Deal ID:", tradeDealId);

      return { receipt, tradeDealId }; // Return both the receipt and extracted tradeDealId
    } catch (e) {
      console.error("Error in createTradeDeal:", e);
      throw e;
    }
  }

  async initializeCarbonCredit(tokenId: number, initialBalance: string) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.carbonCreditService?.connect(this.signer);

      const tx = await contractWithSigner.initializeCarbonCredit(
        tokenId,
        initialBalance // Initial balance for carbon credits (in wei format)
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.log("Error in initializeCarbonCredit:", e);
      throw e;
    }
  }

  async tdDepositInvoice(tradeDealId: number, tokenId: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);

      // Send the transaction
      const tx = await contractWithSigner.tdDepositInvoice(tradeDealId, tokenId);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in tdDepositInvoice:", e);
      throw e;
    }
  }

  async tdDepositUSDC(tradeDealId: number, amount: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      // First approve USDC transfer
      const usdcContractWithSigner: any = this.usdcService?.connect(this.signer);
      let tx = await usdcContractWithSigner.approve(this.contractAddress, amount);
      await tx.wait();

      // Then make the deposit
      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);
      tx = await contractWithSigner.tdDepositUSDC(tradeDealId, amount);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in tdDepositUSDC:", e);
      throw e;
    }
  }

  async tdWithdrawUSDC(tradeDealId: number, amount: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);
      const tx = await contractWithSigner.tdWithdrawUSDC(tradeDealId, amount);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in tdWithdrawUSDC:", e);
      throw e;
    }
  }

  async getTradeDealFullStatus(tradeDealId: number) {
    try {
      if (!this.dedicatedProvider) {
        throw new Error("Provider is not available.");
      }

      const contractWithProvider: any = this.tradeDealService?.connect(this.dedicatedProvider);
      return await contractWithProvider.getTradeDealFullStatus(tradeDealId);
    } catch (e) {
      console.error("Error in getTradeDealFullStatus:", e);
      throw e;
    }
  }

  async isTradeDealFunded(tradeDealId: number) {
    try {
      if (!this.dedicatedProvider) {
        throw new Error("Provider is not available.");
      }

      const contractWithProvider: any = this.tradeDealService?.connect(this.dedicatedProvider);
      return await contractWithProvider.isTradeDealFunded(tradeDealId);
    } catch (e) {
      console.error("Error in isTradeDealFunded:", e);
      throw e;
    }
  }

  async isTradeDealRepaid(tradeDealId: number) {
    try {
      if (!this.dedicatedProvider) {
        throw new Error("Provider is not available.");
      }

      const contractWithProvider: any = this.tradeDealService?.connect(this.dedicatedProvider);
      return await contractWithProvider.isTradeDealRepaid(tradeDealId);
    } catch (e) {
      console.error("Error in isTradeDealRepaid:", e);
      throw e;
    }
  }

  async redeemVABBTokens(tradeDealId: number, vabbAmount: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);
      const tx = await contractWithSigner.redeemVABBTokens(tradeDealId, vabbAmount);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in redeemVABBTokens:", e);
      throw e;
    }
  }

  async repayTradeDeal(tradeDealId: number, amount: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      // First approve USDC transfer
      const usdcContractWithSigner: any = this.usdcService?.connect(this.signer);
      let tx = await usdcContractWithSigner.approve(this.contractAddress, amount);
      await tx.wait();

      // Then make the repayment
      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);
      tx = await contractWithSigner.repayTradeDeal(tradeDealId, amount);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in repayTradeDeal:", e);
      throw e;
    }
  }

  async withdrawTradeDealFunding(tradeDealId: number) {
    try {
      if (!this.signer) {
        throw new Error("Signer is not available.");
      }

      const contractWithSigner: any = this.tradeDealService?.connect(this.signer);
      const tx = await contractWithSigner.withdrawTradeDealFunding(tradeDealId);

      // Wait for the transaction to be mined and return the receipt
      const receipt = await tx.wait();
      return receipt;
    } catch (e) {
      console.error("Error in withdrawTradeDealFunding:", e);
      throw e;
    }
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): BlockchainService | null {
    if (typeof window === "undefined") return null;

    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }

    return BlockchainService.instance;
  }
}
