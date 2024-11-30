"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useKalpApi } from "@/src/hooks/useKapl";
import { NFTData, NFTResponse } from "@/src/types/nft";

export default function DashboardPage() {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<NFTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [earnestAmount, setEarnestAmount] = useState("");

  const { getNFTsOnSale, buyNFT } = useKalpApi();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response: NFTResponse = await getNFTsOnSale();
        setNftData(response.result?.result || []);
      } catch (err) {
        setError("Failed to fetch NFTs. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, []);

  const handleBuy = async () => {
    if (!selectedProperty?.sale?.tokenId) {
      alert("Invalid property. Please try again.");
      return;
    }
    if (!earnestAmount) {
      alert("Please enter the earnest amount");
      return;
    }
    if(Number(earnestAmount) < Number(selectedProperty?.sale?.price)){
      alert("make earnest ammount greater then price")
      setEarnestAmount("")
      return
    }
  
    try {
      const response = await buyNFT(selectedProperty.sale.tokenId, Number(earnestAmount));
  
      if (response?.result?.success) {
        alert("NFT is under processing. Transaction ID: " + response.result.transactionId);
      } else {
        alert("Transaction failed. Please try again.");
      }
    } catch (error) {
      // console.error("Error during the purchase process:", error);
      alert("NFT is under processing.");
    }
  
    // Reset fields
    setEarnestAmount("");
    setSelectedProperty(null);
  };
  
  

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const FallbackImage = "/placeholder.jpg";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">NFT Real Estate Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-full h-64 bg-gray-200 animate-pulse rounded-md"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : nftData.length === 0 ? (
          <div className="text-center text-gray-500">No NFTs available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftData.map((property) => {
              const { nftMetadata, sale } = property;
              if (!nftMetadata?.tokenURI) return null;

              const { name, address, image, description, attributes } = nftMetadata.tokenURI;

              return (
                <Card
                  key={sale.tokenId}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => setSelectedProperty(property)}
                >
                  <CardHeader>
                    <CardTitle>{name || "Unnamed Property"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={image || FallbackImage}
                      alt={name || "NFT Image"}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <p className="text-sm text-gray-600 mb-2">
                      {address || "No Address Available"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {description || "No Description Available"}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Price: {sale.price} ETH
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      Owner: {truncateAddress(nftMetadata.owner) || "Unknown"}
                    </div>
                    <Button onClick={() => setSelectedProperty(property)}>Buy</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Dialog for Purchase Details */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="sm:max-w-[600px] bg-black">
            <DialogHeader>
              <DialogTitle>Buy Property</DialogTitle>
              <DialogDescription>
                Complete your purchase of{" "}
                <span className="font-semibold">{selectedProperty.nftMetadata.tokenURI.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>
                <strong>Price:</strong> {selectedProperty.sale.price} ETH
              </p>
              <div className="grid gap-2">
                <label htmlFor="buyerAddress" className="block text-sm font-medium font-bl">
                  Buyer Address
                </label>
                <input
                  id="buyerAddress"
                  type="text"
                  className="border rounded-md p-2 w-full bg-black"
                  placeholder="Enter your wallet address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="earnestAmount" className="block text-sm font-medium">
                  Earnest Amount (ETH)
                </label>
                <input
                  id="earnestAmount"
                  type="number"
                  className="border rounded-md p-2 w-full bg-black"
                  placeholder="Enter earnest amount"
                  value={earnestAmount}
                  onChange={(e) => setEarnestAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleBuy}>Confirm Purchase</Button>
              <Button variant="outline" onClick={() => setSelectedProperty(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
