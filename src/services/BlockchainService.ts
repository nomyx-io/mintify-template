import {parseEther, ethers, parseUnits} from "ethers";
import GemforceMinterFacet from "../abi/GemforceMinterFacet.json"
import CarbonCreditRegistry from "../abi/CarbonCreditFacet.json";
import TreasuryRegistry from "../abi/ITreasury.json";
import USDCRegistry from "../abi/USDC.json";
import ParseClient from "./ParseClient";


export default class BlockchainService {

    private gemforceMintedAbi = GemforceMinterFacet.abi;
    private carbonCreditAbi = CarbonCreditRegistry.abi;
    private treasuryAbi = TreasuryRegistry.abi;
    private usdcAbi = USDCRegistry.abi;
    private parseClient = ParseClient;
    private provider: ethers.BrowserProvider;
    // private signer: ethers.JsonRpcSigner|undefined;
    private signer: any;
    private gemforceMintService: ethers.Contract|undefined;
    private carbonCreditService: ethers.Contract|undefined;
    private treasuryService: ethers.Contract|undefined;
    private usdcService: ethers.Contract|undefined;

    private contractAddress:any;
    private treasuryAddress:any;
    private usdcAddress:any;

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

        this.gemforceMintService = new ethers.Contract(this.contractAddress, this.gemforceMintedAbi, this.provider);
        this.treasuryService = new ethers.Contract(this.treasuryAddress, this.treasuryAbi, this.provider);
        this.carbonCreditService = new ethers.Contract(this.contractAddress, this.carbonCreditAbi, this.provider);
        this.usdcService = new ethers.Contract(this.usdcAddress, this.usdcAbi, this.provider);
    }

    async getClaimTopics() : Promise<Parse.Object[] | undefined> {
        return await this.parseClient.getRecords('ClaimTopic', [], [], ["*"]);
    }

    async gemforceMint(metaData:any) {
        try{

            if(this.signer){
                //fixme: sending all metadata values as strings for now until contract accepts other datatypes
                const contractWithSigner: any = this.gemforceMintService?.connect(this.signer);
                const tx = await contractWithSigner.gemforceMint(metaData);
                return await tx.wait();
            }

        }catch(e){
            console.log(e);
            throw e;
        }
    }

  async initializeCarbonCredit(tokenId: number, initialBalance: number) {
        try{
            const contractWithSigner: any = this.carbonCreditService?.connect(this.signer);
            const tx = await contractWithSigner.initializeCarbonCredit(tokenId, initialBalance);
            return await tx.wait();
        }catch(e){
            console.log(e);
            throw e;
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

