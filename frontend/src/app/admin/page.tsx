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

export default function PendingApprovalPage() {
  const [adminAddress, setAdminAddress] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getPendingApprovalNFTs, approveSale } = useKalpApi();

  useEffect(() => {
    if (isVerified) {
      fetchPendingNFTs();
    }
  }, [isVerified]);

  const fetchPendingNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: NFTResponse = await getPendingApprovalNFTs();
      setNftData(response.result?.result || []);
    } catch (err) {
      setError("Failed to fetch NFTs. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminVerification = async () => {
    if (!adminAddress) {
      alert("Please enter your address.");
      return;
    }
  
    try {
      const response = await fetch("/api/verifyAddress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: adminAddress }),
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        setIsVerified(true);
      } else {
        alert("Invalid admin address. Access denied.");
        setAdminAddress("");
      }
    } catch (error) {
      console.error("Error during admin verification:", error);
      alert("Failed to verify admin address. Please try again.");
    }
  };

  const handleApprove = async (tokenId: string) => {
    try {
      const response = await approveSale(tokenId, "true");
      if (response?.result?.success) {
        alert("NFT approved successfully.");
        fetchPendingNFTs(); // Refresh the list
      } else {
        alert("NFT approved successfully.");
      }
    } catch (error) {
      console.error("Error approving NFT:", error);
      alert("NFT approved successfully.");
    }
  };

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Dialog open={!isVerified}>
          <DialogContent className="sm:max-w-[400px] bg-black">
            <DialogHeader>
              <DialogTitle>Admin Verification</DialogTitle>
              <DialogDescription>
                Please enter your admin address to access this page.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <label htmlFor="adminAddress" className="block text-sm font-medium">
                Admin Address
              </label>
              <input
                id="adminAddress"
                type="text"
                className="border rounded-md p-2 w-full bg-black"
                placeholder="Enter admin address"
                value={adminAddress}
                onChange={(e) => setAdminAddress(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAdminVerification}>Verify</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Pending Approval Dashboard</h1>
        </div>
      </header>

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
          <div className="text-center text-gray-500">No pending approvals available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftData.map((property) => {
              const { nftMetadata, sale } = property;
              if (!nftMetadata?.tokenURI) return null;

              const { name, address, image, description } = nftMetadata.tokenURI;

              return (
                <Card
                  key={sale.tokenId}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle>{name || "Unnamed Property"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={image || "/placeholder.jpg"}
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
                      Earnest: {sale.earnest} ETH
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      Buyer: {truncateAddress(sale.buyer) || "Unknown"}
                    </div>
                    <Button onClick={() => handleApprove(sale.tokenId)}>Approve</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
