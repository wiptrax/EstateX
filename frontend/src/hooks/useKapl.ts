
export const useKalpApi = () => {

  const apiKey = process.env.NEXT_PUBLIC_AUTH_API_KEY;
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  const callApi = async (endpoint: string, args: { [key: string]: any } = {}) => {
    if (!contractId) {
      throw new Error('Contract ID is not set. Please check your environment variables.');
    }

    const params = {
      network: 'TESTNET',
      blockchain: 'KALP',
      walletAddress: 'b14602f1289c43807a72115f1c902df695a1218d', 
      args: args,
    };

    try {
      console.log(`Calling API: ${endpoint}`, params);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      console.log(`Full API Response:`, data);
      
      if (data.result) {
        console.log(`Result data:`, data.result);
      } else {
        console.log(`No result data found in the response`);
      }

      if (!response.ok) {
        throw new Error(data.message || `API call failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      console.error(`API Error:`, err);
      throw err;
    }
  };

  const mintWithTokenURIWithDetails = async (tokenId: string, name: string, address: string, description: string, image: string, residenceType: string, bedrooms: number, bathrooms: number, squareFeet: number, yearBuilt: number) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/MintWithTokenURIWithDetails';
    const args = {
      tokenId: tokenId,
      name: name,
      address: address,
      description: description,
      image: image,
      residenceType: residenceType,
      bedrooms : bedrooms,
      bathrooms : bathrooms,
      squareFeet : squareFeet,
      yearBuilt : yearBuilt
    };
    return callApi(endpoint, args);
  };

  const listNFTForSale = async (tokenId: string, price: number) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/ListNFTForSale';
    const args = {
      tokenId: tokenId,
      price : price
    };
    return callApi(endpoint, args);
  };

  const getAllNFTs = async () => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/query/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/GetAllNFTs';
    const args = {};
    return callApi(endpoint, args);
  };

  const getNFTsOnSale = async () => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/query/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/GetNFTsOnSale';
    const args = {};
    return callApi(endpoint, args);
  };

  const buyNFT= async (tokenId: string, earnest: number) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/BuyNFT';
    const args = {
      tokenId: tokenId,
      earnest : earnest
    };
    return callApi(endpoint, args);
  };

  const getPendingApprovalNFTs = async () => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/query/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/GetPendingApprovalNFTs';
    const args = {};
    return callApi(endpoint, args);
  };

  const approveSale= async (tokenId: string, isApproved: string) => {
    const endpoint =
      'https://gateway-api.kalp.studio/v1/contract/kalp/invoke/0Azlv5TZKM5Ye6j54r0BUwgV1e5zcP481727064711138/BuyNFT';
    const args = {
      tokenId: tokenId,
      isApproved : isApproved
    };
    return callApi(endpoint, args);
  };

  return {mintWithTokenURIWithDetails, listNFTForSale, getAllNFTs, getNFTsOnSale, buyNFT, getPendingApprovalNFTs, approveSale };
};