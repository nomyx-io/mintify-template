import { ethers } from "ethers";
import PubSub from 'pubsub-js';
import * as LLMintedRegistry from "../abi/ILenderLabMinterFacet.json";

import ParseClient from "./Parclient";

class BlockchainService {

    llMintedAbi = LLMintedRegistry.abi;
    parseClient = ParseClient;

    constructor(provider, contractAddress) {
        this.provider = provider;
        this.provider.getSigner().then(signer=>this.signer = signer);
        this.llMintService = new ethers.Contract(contractAddress, this.llMintedAbi, this.provider);

        this.llmint = this.llmint.bind(this)
        this.getClaimTopics = this.getClaimTopics.bind(this)

        this.parseClient.initialize();
    }

    // Event listeners
    publish(event, data) {
        PubSub.publish(event, data);
    }

    subscribe(event, handler) {
        return PubSub.subscribe(event, handler);
    }

    unsubscribe(token) {
        return PubSub.unsubscribe(token);
    }

    async getClaimTopics() {
        return await this.parseClient.getRecords('ClaimTopic', [], [], ["*"]);
    }

    async llmint(metaData) {
        try{
            const contractWithSigner = this.llMintService.connect(this.signer);
            const tx = await contractWithSigner.llMint(metaData);
            return await tx.wait();
        }catch(e){
            console.log(e);
            throw e;
        }

    }

}

export default BlockchainService;
