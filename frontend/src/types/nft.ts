export interface NFTAttribute {
    trait_type: string;
    value: string | number;
  }
  
  export interface NFTTokenURI {
    name: string;
    address: string;
    description: string;
    image: string;
    id: string;
    attributes: NFTAttribute[];
  }
  
  export interface NFTMetadata {
    tokenId: string;
    owner: string;
    tokenURI: NFTTokenURI;
    approved: string;
  }
  
  export interface NFTSale {
    tokenId: string;
    seller: string;
    price: number;
    isOnSale: boolean;
    isPendingApproval: boolean;
    earnest: number;
    buyer: string;
    isApproved: string;
  }
  
  export interface NFTData {
    sale: NFTSale;
    nftMetadata: NFTMetadata;
    tokenURI: any;
    owner: any;
    tokenId: any

  }
  
  export interface NFTResponse {
    timestamp: string;
    status: string;
    message: string;
    result: {
      success: boolean;
      httpStatus: number;
      result: NFTData[];
    };
  }