package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"github.com/p2eengineering/kalp-sdk-public/kalpsdk"
)

// Define objectType names for prefix
const balancePrefix = "balance"
const nftPrefix = "nft"
const salePrefix = "sale"
const tokenCounterKey = "tokenCounter"

// Define key names for options
const nameKey = "name"
const symbolKey = "symbol"
const inspectorAddress = "3a94baaef8c1ac6fd16bbf8dc6c6393655f65ab0" // Set during deployment


type TokenURI struct {
	Name        string      `json:"name"`
	Address     string      `json:"address"`
	Description string      `json:"description"`
	Image       string      `json:"image"`
	Id          string      `json:"id"`
	Attributes  []Attribute `json:"attributes"`
}

type Attribute struct {
	TraitType string      `json:"trait_type"`
	Value     interface{} `json:"value"`
}

type Nft struct {
	TokenId  string `json:"tokenId"`
	Owner    string `json:"owner"`
	TokenURI TokenURI `json:"tokenURI"`
	Approved string `json:"approved"`
}

type Transfer struct {
	From    string `json:"from"`
	To      string `json:"to"`
	TokenId string `json:"tokenId"`
}

// Sale represents an NFT on sale
type Sale struct {
	TokenId    string  `json:"tokenId"`
	Seller     string  `json:"seller"`
	Price      int `json:"price"` // Asking price
	IsOnSale   bool    `json:"isOnSale"`
	IsPendingApproval bool   `json:"isPendingApproval"`  // New field for pending approval status
	Earnest    int `json:"earnest"`
	Buyer      string  `json:"buyer"`
	IsApproved string    `json:"isApproved"`
}

// SaleWithMetadata combines the Sale information with the NFT metadata
type SaleWithMetadata struct {
	Sale       Sale  `json:"sale"`
	NftMetadata Nft  `json:"nftMetadata"`
}

type TokenERC721Contract struct {
	kalpsdk.Contract
	deployer string
}

func (c *TokenERC721Contract) Initialize(ctx kalpsdk.TransactionContextInterface, name string, symbol string, inspector string) (bool, error) {
	// Only the deployer can call this function
	clientID, err := ctx.GetUserID()
	if err != nil {
		return false, fmt.Errorf("failed to get client identity: %v", err)
	}

	// Store deployer address
	c.deployer = clientID

	// Store the token name and symbol in state
	err = ctx.PutStateWithoutKYC(nameKey, []byte(name))
	if err != nil {
		return false, fmt.Errorf("failed to put state for name: %v", err)
	}
	err = ctx.PutStateWithoutKYC(symbolKey, []byte(symbol))
	if err != nil {
		return false, fmt.Errorf("failed to put state for symbol: %v", err)
	}

	return true, nil
}

// MintWithTokenURIWithDetails allows minting a new NFT with detailed tokenURI metadata
func (c *TokenERC721Contract) MintWithTokenURIWithDetails(
	ctx kalpsdk.TransactionContextInterface, 
	tokenId string, 
	name string, 
	address string, 
	description string, 
	image string,
	residenceType string, 
	bedrooms int, 
	bathrooms int, 
	squareFeet int, 
	yearBuilt int) (*Nft, error) {

	// Check if contract has been initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return nil, fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	// Check if the caller is the deployer
	clientID, err := ctx.GetUserID()
	if err != nil {
		return nil, fmt.Errorf("failed to get client identity: %v", err)
	}
	if clientID != c.deployer {
		return nil, fmt.Errorf("only the deployer can mint new tokens")
	}

	// Check if the token to be minted already exists
	exists := _nftExists(ctx, tokenId)
	if exists {
		return nil, fmt.Errorf("the token %s is already minted", tokenId)
	}

	// Get the current tokenCounter from the ledger (to ensure tokenId starts from 1 and increments)
	tokenCounterBytes, err := ctx.GetState(tokenCounterKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get tokenCounter: %v", err)
	}
	tokenCounter := 0
	if tokenCounterBytes != nil {
		err = json.Unmarshal(tokenCounterBytes, &tokenCounter)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal tokenCounter: %v", err)
		}
	}
	// Increment the tokenCounter
	tokenCounter++

	// Convert tokenCounter to string for use as tokenId
	tokenId = strconv.Itoa(tokenCounter)

	// Create the detailed tokenURI metadata
	tokenURI := TokenURI{
		Name:        name,
		Address:     address,
		Description: description,
		Image:       image,
		Id:          tokenId,
		Attributes: []Attribute{
			{TraitType: "Type of Residence", Value: residenceType},
			{TraitType: "Bedrooms", Value: bedrooms},
			{TraitType: "Bathrooms", Value: bathrooms},
			{TraitType: "Square Feet", Value: squareFeet},
			{TraitType: "Year Built", Value: yearBuilt},
		},
	}

	// // Convert tokenURI to JSON format
	// tokenURIBytes, err := json.Marshal(tokenURI)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to marshal tokenURI: %v", err)
	// }

	// Add the non-fungible token to the blockchain state
	nft := &Nft{
		TokenId:  tokenId,
		Owner:    clientID,
		TokenURI: tokenURI, // Store as a JSON string
	}

	nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{tokenId})
	if err != nil {
		return nil, fmt.Errorf("failed to create composite key: %v", err)
	}

	nftBytes, err := json.Marshal(nft)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal nft: %v", err)
	}

	err = ctx.PutStateWithoutKYC(nftKey, nftBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to put state: %v", err)
	}

	// Emit transfer event for minting
	transferEvent := Transfer{From: "0x0", To: clientID, TokenId: tokenId}
	eventBytes, err := json.Marshal(transferEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal transfer event: %v", err)
	}

	err = ctx.SetEvent("Transfer", eventBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to set transfer event: %v", err)
	}

	// Save the updated tokenCounter in the state
	tokenCounterBytes, err = json.Marshal(tokenCounter)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updated tokenCounter: %v", err)
	}
	err = ctx.PutStateWithoutKYC(tokenCounterKey, tokenCounterBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to put updated tokenCounter in state: %v", err)
	}

	return nft, nil
}

// ListNFTForSale allows the owner to list their NFT for sale
func (c *TokenERC721Contract) ListNFTForSale(ctx kalpsdk.TransactionContextInterface, tokenId string, price int) (bool, error) {
	ownerID, err := ctx.GetUserID()
	if err != nil {
		return false, fmt.Errorf("failed to get owner identity: %v", err)
	}

	nft, err := _readNFT(ctx, tokenId)
	if err != nil {
		return false, fmt.Errorf("failed to read NFT: %v", err)
	}

	if nft.Owner != ownerID {
		return false, fmt.Errorf("only the owner can list the NFT for sale")
	}

	// Create the sale object
	sale := &Sale{
		TokenId:  tokenId,
		Seller:   ownerID,
		Price:    price,
		IsOnSale: true,
	}

	saleKey, err := ctx.CreateCompositeKey(salePrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("failed to create sale composite key: %v", err)
	}

	saleBytes, err := json.Marshal(sale)
	if err != nil {
		return false, fmt.Errorf("failed to marshal sale data: %v", err)
	}

	err = ctx.PutStateWithoutKYC(saleKey, saleBytes)
	if err != nil {
		return false, fmt.Errorf("failed to put state for sale: %v", err)
	}

	return true, nil
}

// GetAllNFTs retrieves all NFTs from the ledger
func (c *TokenERC721Contract) GetAllNFTs(ctx kalpsdk.TransactionContextInterface) ([]*Nft, error) {
	// Create an iterator for all the NFT keys (using nftPrefix)
	iterator, err := ctx.GetStateByPartialCompositeKey(nftPrefix, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key for NFTs: %v", err)
	}
	defer iterator.Close()

	// Create a slice to hold the NFT metadata
	var allNFTs []*Nft

	// Iterate over all NFT entries
	for iterator.HasNext() {
		queryResponse, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next NFT: %v", err)
		}

		// Unmarshal the NFT metadata
		var nft Nft
		err = json.Unmarshal(queryResponse.Value, &nft)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal NFT data: %v", err)
		}

		// Append the NFT to the list
		allNFTs = append(allNFTs, &nft)
	}

	// Return the list of all NFTs
	return allNFTs, nil
}

// GetNFTsOnSale returns all NFTs that are currently listed for sale, along with their metadata
func (c *TokenERC721Contract) GetNFTsOnSale(ctx kalpsdk.TransactionContextInterface) ([]*SaleWithMetadata, error) {
	// Create an iterator for all the sale listings
	iterator, err := ctx.GetStateByPartialCompositeKey(salePrefix, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key for sales: %v", err)
	}
	defer iterator.Close()

	// Create a slice to hold the NFTs that are on sale with their metadata
	var nftsOnSale []*SaleWithMetadata

	// Iterate over all sale listings
	for iterator.HasNext() {
		queryResponse, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next sale listing: %v", err)
		}

		// Unmarshal the sale object
		var sale Sale
		err = json.Unmarshal(queryResponse.Value, &sale)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal sale data: %v", err)
		}

		// Only process if the NFT is on sale
		if sale.IsOnSale {
			// Fetch the corresponding NFT metadata using the tokenId
			nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{sale.TokenId})
			if err != nil {
				return nil, fmt.Errorf("failed to create composite key for nft: %v", err)
			}

			nftBytes, err := ctx.GetState(nftKey)
			if err != nil {
				return nil, fmt.Errorf("failed to get NFT metadata for tokenId %s: %v", sale.TokenId, err)
			}
			if nftBytes == nil {
				return nil, fmt.Errorf("NFT not found for tokenId %s", sale.TokenId)
			}

			// Unmarshal the NFT metadata
			var nft Nft
			err = json.Unmarshal(nftBytes, &nft)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal NFT metadata for tokenId %s: %v", sale.TokenId, err)
			}

			// Combine Sale and NFT Metadata
			saleWithMetadata := &SaleWithMetadata{
				Sale:       sale,
				NftMetadata: nft,
			}

			// Add to the list of NFTs on sale
			nftsOnSale = append(nftsOnSale, saleWithMetadata)
		}
	}

	// Return the list of NFTs on sale with their metadata
	return nftsOnSale, nil
}


// BuyNFT allows a buyer to send earnest money and request a sale approval
func (c *TokenERC721Contract) BuyNFT(ctx kalpsdk.TransactionContextInterface, tokenId string, earnest int) (bool, error) {
	buyerID, err := ctx.GetUserID()
	if err != nil {
		return false, fmt.Errorf("failed to get buyer identity: %v", err)
	}

	saleKey, err := ctx.CreateCompositeKey(salePrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("failed to create sale composite key: %v", err)
	}

	saleBytes, err := ctx.GetState(saleKey)
	if err != nil {
		return false, fmt.Errorf("failed to get sale data: %v", err)
	}
	if len(saleBytes) == 0 {
		return false, fmt.Errorf("NFT not listed for sale")
	}

	sale := new(Sale)
	err = json.Unmarshal(saleBytes, sale)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal sale data: %v", err)
	}

	if !sale.IsOnSale {
		return false, fmt.Errorf("NFT is not on sale")
	}

	if earnest < sale.Price {
		return false, fmt.Errorf("earnest money must be equal to or greater than the asking price")
	}

	// Update sale with buyer information and earnest money
	sale.Buyer = buyerID
	sale.Earnest = earnest
	sale.IsPendingApproval = true // Mark as pending approval

	saleBytes, err = json.Marshal(sale)
	if err != nil {
		return false, fmt.Errorf("failed to marshal updated sale: %v", err)
	}

	err = ctx.PutStateWithoutKYC(saleKey, saleBytes)
	if err != nil {
		return false, fmt.Errorf("failed to update sale state: %v", err)
	}

	return true, nil
}

// GetPendingApprovalNFTs returns all NFTs that are pending approval for sale, along with their metadata
func (c *TokenERC721Contract) GetPendingApprovalNFTs(ctx kalpsdk.TransactionContextInterface) ([]*SaleWithMetadata, error) {
	// Create an iterator for all the sale listings
	iterator, err := ctx.GetStateByPartialCompositeKey(salePrefix, []string{})
	if err != nil {
		return nil, fmt.Errorf("failed to get state by partial composite key for sales: %v", err)
	}
	defer iterator.Close()

	// Create a slice to hold the NFTs that are pending approval with their metadata
	var pendingApprovals []*SaleWithMetadata

	// Iterate over all sale listings
	for iterator.HasNext() {
		queryResponse, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next sale listing: %v", err)
		}

		// Unmarshal the sale object
		var sale Sale
		err = json.Unmarshal(queryResponse.Value, &sale)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal sale data: %v", err)
		}

		// Only process if the NFT is pending approval
		if sale.IsPendingApproval {
			// Fetch the corresponding NFT metadata using the tokenId
			nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{sale.TokenId})
			if err != nil {
				return nil, fmt.Errorf("failed to create composite key for nft: %v", err)
			}

			nftBytes, err := ctx.GetState(nftKey)
			if err != nil {
				return nil, fmt.Errorf("failed to get NFT metadata for tokenId %s: %v", sale.TokenId, err)
			}
			if nftBytes == nil {
				return nil, fmt.Errorf("NFT not found for tokenId %s", sale.TokenId)
			}

			// Unmarshal the NFT metadata
			var nft Nft
			err = json.Unmarshal(nftBytes, &nft)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal NFT metadata for tokenId %s: %v", sale.TokenId, err)
			}

			// Combine Sale and NFT Metadata
			saleWithMetadata := &SaleWithMetadata{
				Sale:        sale,
				NftMetadata: nft,
			}

			// Add to the list of NFTs pending approval
			pendingApprovals = append(pendingApprovals, saleWithMetadata)
		}
	}

	// Return the list of NFTs pending approval with their metadata
	return pendingApprovals, nil
}


// ApproveSale allows the inspector to approve or reject a sale
func (c *TokenERC721Contract) ApproveSale(ctx kalpsdk.TransactionContextInterface, tokenId string, isApproved string) (bool, error) {
	inspectorID, err := ctx.GetUserID()
	if err != nil {
		return false, fmt.Errorf("failed to get inspector identity: %v", err)
	}

	// Ensure only the inspector can approve or reject the sale
	if inspectorID != inspectorAddress {
		return false, fmt.Errorf("only the inspector can approve or reject the sale")
	}

	// Fetch the sale information
	saleKey, err := ctx.CreateCompositeKey(salePrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("failed to create sale composite key: %v", err)
	}

	saleBytes, err := ctx.GetState(saleKey)
	if err != nil {
		return false, fmt.Errorf("failed to get sale data: %v", err)
	}
	if len(saleBytes) == 0 {
		return false, fmt.Errorf("NFT sale not found")
	}

	sale := new(Sale)
	err = json.Unmarshal(saleBytes, sale)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal sale data: %v", err)
	}

	if !sale.IsOnSale {
		return false, fmt.Errorf("NFT is not on sale")
	}

	if (isApproved == "true")  {
		// Approve the sale and transfer the NFT to the buyer
		sale.IsApproved = "true"
		sale.IsOnSale = false
		sale.IsPendingApproval = false // Reset pending approval

		// Get the current NFT data
		nft, err := _readNFT(ctx, tokenId)
		if err != nil {
			return false, fmt.Errorf("failed to read NFT: %v", err)
		}

		// Transfer ownership of the NFT to the buyer
		oldOwner := nft.Owner
		nft.Owner = sale.Buyer

		// Update the NFT state
		nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{tokenId})
		if err != nil {
			return false, fmt.Errorf("failed to create composite key for NFT: %v", err)
		}

		nftBytes, err := json.Marshal(nft)
		if err != nil {
			return false, fmt.Errorf("failed to marshal updated NFT: %v", err)
		}

		err = ctx.PutStateWithoutKYC(nftKey, nftBytes)
		if err != nil {
			return false, fmt.Errorf("failed to put state for updated NFT: %v", err)
		}

		// Remove the NFT from the seller's balance
		balanceKeyFrom, err := ctx.CreateCompositeKey(balancePrefix, []string{oldOwner, tokenId})
		if err != nil {
			return false, fmt.Errorf("failed to create balance composite key from: %v", err)
		}
		err = ctx.DelStateWithoutKYC(balanceKeyFrom)
		if err != nil {
			return false, fmt.Errorf("failed to delete seller's balance key: %v", err)
		}

		// Add the NFT to the buyer's balance
		balanceKeyTo, err := ctx.CreateCompositeKey(balancePrefix, []string{sale.Buyer, tokenId})
		if err != nil {
			return false, fmt.Errorf("failed to create balance composite key to: %v", err)
		}
		err = ctx.PutStateWithoutKYC(balanceKeyTo, []byte{'\u0000'})
		if err != nil {
			return false, fmt.Errorf("failed to put state for buyer's balance key: %v", err)
		}

		// Emit the Transfer event
		transferEvent := Transfer{
			From:    oldOwner,
			To:      sale.Buyer,
			TokenId: tokenId,
		}
		transferEventBytes, err := json.Marshal(transferEvent)
		if err != nil {
			return false, fmt.Errorf("failed to marshal transfer event: %v", err)
		}
		err = ctx.SetEvent("Transfer", transferEventBytes)
		if err != nil {
			return false, fmt.Errorf("failed to set transfer event: %v", err)
		}

	} else {
		// Sale is rejected, return the earnest money to the buyer
		sale.Earnest = 0
		sale.Buyer = ""
		sale.IsOnSale = true
		sale.IsPendingApproval = false // Reset pending approval
		sale.IsApproved = "false"
	}

	// Update sale information in the ledger
	saleBytes, err = json.Marshal(sale)
	if err != nil {
		return false, fmt.Errorf("failed to marshal updated sale: %v", err)
	}

	err = ctx.PutStateWithoutKYC(saleKey, saleBytes)
	if err != nil {
		return false, fmt.Errorf("failed to update sale state: %v", err)
	}

	return true, nil
}

// Additional methods like checkInitialized, _nftExists, and others remain unchanged.

func _readNFT(ctx kalpsdk.TransactionContextInterface, tokenId string) (*Nft, error) {
	nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{tokenId})
	if err != nil {
		return nil, fmt.Errorf("failed to CreateCompositeKey %s: %v", tokenId, err)
	}

	nftBytes, err := ctx.GetState(nftKey)
	if err != nil {
		return nil, fmt.Errorf("failed to GetState %s: %v", tokenId, err)
	}

	nft := new(Nft)
	err = json.Unmarshal(nftBytes, nft)
	if err != nil {
		return nil, fmt.Errorf("failed to Unmarshal nftBytes: %v", err)
	}

	return nft, nil
}

func _nftExists(ctx kalpsdk.TransactionContextInterface, tokenId string) bool {
	nftKey, err := ctx.CreateCompositeKey(nftPrefix, []string{tokenId})
	if err != nil {
		panic("error creating CreateCompositeKey:" + err.Error())
	}

	nftBytes, err := ctx.GetState(nftKey)
	if err != nil {
		panic("error GetState nftBytes:" + err.Error())
	}

	return len(nftBytes) > 0
}

func (c *TokenERC721Contract) OwnerOf(ctx kalpsdk.TransactionContextInterface, tokenId string) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	nft, err := _readNFT(ctx, tokenId)
	if err != nil {
		return "", fmt.Errorf("could not process OwnerOf for tokenId: %w", err)
	}

	return nft.Owner, nil
}

// Name returns a descriptive name for a collection of non-fungible tokens in this contract
// returns {String} Returns the name of the token

func (c *TokenERC721Contract) Name(ctx kalpsdk.TransactionContextInterface) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := ctx.GetState(nameKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Name bytes: %s", err)
	}

	return string(bytes), nil
}

// Symbol returns an abbreviated name for non-fungible tokens in this contract.
// returns {String} Returns the symbol of the token

func (c *TokenERC721Contract) Symbol(ctx kalpsdk.TransactionContextInterface) (string, error) {

	// Check if contract has been intilized first
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return "", fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize contract")
	}

	bytes, err := ctx.GetState(symbolKey)
	if err != nil {
		return "", fmt.Errorf("failed to get Symbol: %v", err)
	}

	return string(bytes), nil
}

// GetNFTMetadata retrieves the complete NFT metadata by tokenId
func (c *TokenERC721Contract) GetNFTMetadata(ctx kalpsdk.TransactionContextInterface, tokenId string) (*Nft, error) {

	// Check if the contract has been initialized
	initialized, err := checkInitialized(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check if contract is already initialized: %v", err)
	}
	if !initialized {
		return nil, fmt.Errorf("contract options need to be set before calling any function, call Initialize() to initialize the contract")
	}

	// Read the NFT from the state
	nft, err := _readNFT(ctx, tokenId)
	if err != nil {
		return nil, fmt.Errorf("failed to read NFT for tokenId %s: %v", tokenId, err)
	}

	// Return the complete NFT metadata, including the TokenURI
	return nft, nil
}


// Checks that contract options have been already initialized
func checkInitialized(ctx kalpsdk.TransactionContextInterface) (bool, error) {
	tokenName, err := ctx.GetState(nameKey)
	if err != nil {
		return false, fmt.Errorf("failed to get token name: %v", err)
	}
	if tokenName == nil {
		return false, nil
	}
	return true, nil
}