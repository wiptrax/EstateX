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
import { Badge } from "@/src/components/ui/badge";
import { Home, BedDouble, Bath, Square, CalendarDays, User } from "lucide-react";
import { useKalpApi } from "@/src/hooks/useKapl";
import { NFTData, NFTResponse } from "@/src/types/nft";

export default function DashboardPage() {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<NFTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getAllNFTs } = useKalpApi();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response: NFTResponse = await getAllNFTs();
        setNftData(response.result.result || []);
      } catch (err) {
        setError("Failed to fetch NFTs. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [getAllNFTs]);

  const handleBuy = (property: NFTData) => {
    console.log(`Buying property: ${property.tokenURI.name}`);
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
              const { tokenURI, owner } = property;
              if (!tokenURI) return null;

              const { name, address, image, description } = tokenURI;

              return (
                <Card
                  key={property.tokenId}
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
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-gray-500">
                      Owner: {truncateAddress(owner) || "Unknown"}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Dialog for Property Details */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="sm:max-w-[600px] bg-black">
            <DialogHeader>
              <DialogTitle>{selectedProperty.tokenURI.name}</DialogTitle>
              <DialogDescription>
                {selectedProperty.tokenURI.address}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <img
                src={selectedProperty.tokenURI.image || FallbackImage}
                alt={selectedProperty.tokenURI.name}
                className="w-full h-64 object-cover rounded-md"
              />
              <div className="flex justify-between items-center">
                <Badge variant="outline">Token ID: {selectedProperty.tokenId}</Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-1" />
                Owner: {truncateAddress(selectedProperty.owner)}
              </div>
              <p>{selectedProperty.tokenURI.description}</p>
              <div className="grid grid-cols-2 gap-4">
                {selectedProperty.tokenURI.attributes.map((attr, index) => (
                  <div key={index} className="flex items-center">
                    {attr.trait_type === "Type of Residence" && <Home className="mr-2" />}
                    {attr.trait_type === "Bedrooms" && <BedDouble className="mr-2" />}
                    {attr.trait_type === "Bathrooms" && <Bath className="mr-2" />}
                    {attr.trait_type === "Square Feet" && <Square className="mr-2" />}
                    {attr.trait_type === "Year Built" && <CalendarDays className="mr-2" />}
                    <span>{attr.trait_type}: {attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
           
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
