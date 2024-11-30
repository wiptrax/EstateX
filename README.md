# EstateX: Real Estate NFT Platform

## Overview

EstateX is a cutting-edge platform for buying and selling real estate as NFTs. Built using **Next.js** and powered by the **Kalp DLT blockchain**, it provides a secure and transparent ecosystem for real estate transactions. 

With EstateX, users can tokenize real estate properties into NFTs, enabling fractional ownership, simplified transfers, and enhanced liquidity. However, for added security and compliance, **all purchase requests require administrative approval** before being processed.

---

## Features

- **Buy and Sell NFTs**: Seamlessly trade real estate-backed NFTs on the EstateX platform.
- **Blockchain Security**: Transactions are secured and verified on the **Kalp DLT blockchain**.
- **Administrative Approval**: A centralized admin ensures all buy demands are validated for security and compliance.
- **Next.js Performance**: Fast and responsive user experience, powered by Next.js.

---

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/)
- **Blockchain**: [Kalp DLT](https://kalp.studio/) for decentralized transaction management.

---

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- NPM or Yarn
- Access to a Kalp DLT node

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wiptrax/estatex.git
   cd estatex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add the following:
   ```env
   NEXT_PUBLIC_API_KEY=<your Kalp DLT Api Auth key>
   NEXT_PUBLIC_CONTRACT_ID=<backend smart contract address>
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## Workflow

1. **User Action**:
   - Users can browse available NFTs and place buy requests through the platform.

2. **Admin Approval**:
   - Buy demands are routed to an admin for manual approval. 
   - Approved demands trigger the execution of the NFT transfer on the Kalp DLT blockchain.

3. **Transaction Completion**:
   - Once approved, the smart contract finalizes the transaction, and ownership is transferred securely.

---

## Admin Panel

Admins have access to a dedicated panel where they can:
- View all pending buy requests.
- Approve or reject transactions.
- Monitor platform activity.

---

## Contributing

We welcome contributions to improve the platform! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes and push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a pull request on GitHub.

---

## License

EstateX is open-source and distributed under the [MIT License](LICENSE).

---

Join the future of real estate with EstateX! 🚀