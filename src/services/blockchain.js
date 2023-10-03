import { ethers } from "ethers";
import PubSub from 'pubsub-js';
import * as LLMintedRegistry from "../abi/LLMintedRegistry.json";



class BlockchainService {
    llMintedAbi = LLMintedRegistry.abi;

    constructor(provider, contractAddress, identityRegistryAddress) {
        this.provider = provider;
        this.signer = this.provider.getSigner();

        this.claimTopicRegistryService = new ethers.Contract(contractAddress, this.llMintedAbi, this.provider);
        // Claim Topics Registry
        this.addClaimTopic = this.addClaimTopic.bind(this);
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


    async addClaimTopic(claimTopic) {
        const contractWithSigner = this.claimTopicRegistryService.connect(this.signer);
        const tx = await contractWithSigner.addClaimTopic(claimTopic);
        return await tx.wait();
    }

}

export default BlockchainService;