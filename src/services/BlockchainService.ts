import {parseEther, ethers, parseUnits} from "ethers";
import GFMintedRegistry from "../abi/IGemForceMinterFacet.json";
import TreasuryRegistry from "../abi/ITreasury.json";
import USDCRegistry from "../abi/USDC.json";
import MarketplaceRegistry from "../abi/IMarketplaceFacet.json";
import CarbonCreditRegistry from "../abi/ICarbonCreditFacet.json";
import ParseClient from "./ParseClient";

export default class BlockchainService {

    private gfMintedAbi = GFMintedRegistry.abi;
    private treasuryAbi = TreasuryRegistry.abi;
    private usdcAbi = USDCRegistry.abi;
    private marketplaceAbi = MarketplaceRegistry.abi;
    private carbonCreditAbi = CarbonCreditRegistry.abi;
    private parseClient = ParseClient;
    private provider: ethers.BrowserProvider;
    // private signer: ethers.JsonRpcSigner|undefined;
    private signer: any;
    private gfMintService: ethers.Contract|undefined;
    private treasuryService: ethers.Contract|undefined;
    private usdcService: ethers.Contract|undefined;
    private marketplaceService: ethers.Contract|undefined;
    private carbonCreditService: ethers.Contract|undefined;

    private contractAddress:any;
    private treasuryAddress:any;
    private usdcAddress:any;
    private marketplaceAddress:any;
    private carbonCreditAddress:any;

    private static instance: BlockchainService;

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */

    constructor() {
        let ethObject = (window as any).ethereum;
        this.provider = new ethers.BrowserProvider(ethObject);
        this.provider.getSigner().then(signer=>this.signer = signer);

        this.gemforceMint = this.gemforceMint.bind(this)
        this.getClaimTopics = this.getClaimTopics.bind(this)

        this.parseClient.initialize();

        this.init();
    }

    private async init(){
        const jsonConfig: any = await import(`../hardhatConfig.json`);
        const network = await this.provider.getNetwork();
        const chainId: any = network.chainId;

        console.log('chainId = ' + chainId);

        const chainConfig = jsonConfig[chainId];

        if (!chainConfig) {
            // setUnsupportedNetworkDialogVisible(true);
            // return;
            throw new Error(`Unable to find ${chainId} in hardhatConfig`);
        }

        this.contractAddress = chainConfig.contract;
        this.treasuryAddress = chainConfig.treasury;
        this.usdcAddress = chainConfig.usdc;
        this.marketplaceAddress = chainConfig.marketplace;
        this.carbonCreditAddress = chainConfig.carbonCredit;

        this.gfMintService = new ethers.Contract(this.contractAddress, this.gfMintedAbi, this.provider);
        this.treasuryService = new ethers.Contract(this.treasuryAddress, this.treasuryAbi, this.provider);
        this.carbonCreditService = new ethers.Contract(this.contractAddress, this.carbonCreditAbi, this.provider);
        this.usdcService = new ethers.Contract(this.usdcAddress, this.usdcAbi, this.provider);
        this.marketplaceService = new ethers.Contract(this.contractAddress, this.marketplaceAbi, this.provider);
        this.carbonCreditService = new ethers.Contract(this.contractAddress, this.carbonCreditAbi, this.provider);
    }

    async getClaimTopics() : Promise<Parse.Object[] | undefined> {
        return await this.parseClient.getRecords('ClaimTopic', [], [], ["*"]);
    }

    async gemforceMint(metaData: any): Promise<{ tokenId: number, transactionHash: string }> {
        try {
          if (this.signer) {
            // Get the contract instance with the signer
            const contractWithSigner: any = this.gfMintService?.connect(this.signer);
      
            // Send the transaction and get the transaction object immediately
            const tx = await contractWithSigner.gemforceMint(metaData);
            const transactionHash = tx.hash;  // Get the transaction hash here, not from the receipt
            
            console.log('transactionHash:', transactionHash);  // Log the transaction hash
      
            // Wait for the transaction to be mined and get the receipt
            const receipt = await tx.wait();
      
            // Now, lookup the Parse record using the transaction hash
            const parseRecord = await ParseClient.getRecords('Token', ['transactionHash'], [transactionHash], ["*"]);
      
            if (!parseRecord || parseRecord.length === 0) {
              throw new Error("Parse record not found for the given transaction hash.");
            }
      
            // Retrieve the tokenId from the parseRecord
            const tokenId = parseRecord[0]?.attributes?.tokenId;
      
            return { tokenId, transactionHash };
          } else {
            throw new Error("Signer is not available.");
          }
        } catch (e) {
          console.error("Error in gemforceMint:", e);
          throw e;  // Re-throw the error after logging it
        }
      }

    async deposit(depositData:any){
        try{

            const totalAmount = depositData.reduce((accumulator:any, depositEntry:any)=>accumulator += parseInt(depositEntry.amount), 0);
            const usdcContractWithSinger : any = this.usdcService?.connect(this.signer);
            //const parsedTotalAmount =   parseEther(totalAmount.toString());
            const parsedTotalAmount = parseUnits(totalAmount.toString(), 6); // Assuming 6 decimal places for USDC
            let tx = await usdcContractWithSinger.approve(this.treasuryAddress, parsedTotalAmount);
            await tx.wait();

            const contractWithSigner : any = this.treasuryService?.connect(this.signer);
            const contractRequestBody = depositData.map((deposit: any) => [deposit.tokenId, parseUnits(String(deposit.amount), 6)]);
            tx = await contractWithSigner.deposit(contractRequestBody);
            return await tx.wait();
        }catch(e){
            console.log(e);
            throw e;
        }
    }

    async listItem(
        receiver: string,  // Address that will receive the funds
        tokenId: number,   // The token ID of the NFT to list
        price: string,     // The price of the NFT in wei
        transferNFT: boolean  // Whether to transfer the NFT to the marketplace
      ) {
        try {
          if (!this.signer) {
            throw new Error('Signer is not available.');
          }
      
          const contractWithSigner: any = this.marketplaceService?.connect(this.signer);
          const tx = await contractWithSigner.listItem(
            this.contractAddress,  // Hardcoded NFT contract address
            receiver,              // Address that will receive payment
            tokenId,               // Token ID of the NFT
            price,                 // Price in wei
            transferNFT            // Transfer the NFT or not
          );
      
          // Wait for the transaction to be mined
          const receipt = await tx.wait();
          console.log("Listing transaction hash:", receipt.transactionHash);
          return receipt;
        } catch (e) {
          console.log("Error in listItem:", e);
          throw e;
        }
      }
      

      async delistItem(
        tokenId: number  
      ) {
        try {
          if (!this.signer) {
            throw new Error('Signer is not available.');
          }
      
          const contractWithSigner: any = this.marketplaceService?.connect(this.signer);
          const tx = await contractWithSigner.delistItem(
            this.contractAddress,  
            tokenId                
          );
      
          // Wait for the transaction to be mined
          const receipt = await tx.wait();
          console.log("Delisting transaction hash:", receipt.transactionHash);
          return receipt;
        } catch (e) {
          console.log("Error in delistItem:", e);
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
            initialBalance       // Initial balance for carbon credits (in wei format)
          );
      
          // Wait for the transaction to be mined
          const receipt = await tx.wait();
          console.log("Initialize Carbon Credit transaction hash:", receipt.transactionHash);
          return receipt;
        } catch (e) {
          console.log("Error in initializeCarbonCredit:", e);
          throw e;
        }
      }
      

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): BlockchainService|null {

        if (typeof window === 'undefined')return null;

        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }

        return BlockchainService.instance;
    }
}

