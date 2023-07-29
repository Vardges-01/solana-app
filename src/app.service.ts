import { Injectable } from '@nestjs/common';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

@Injectable()
export class AppService {
  private solanaConnection: Connection;

  constructor() {
    const WSS_ENDPOINT = process.env.WSS_ENDPOINT;
    const HTTP_ENDPOINT = process.env.HTTP_ENDPOINT;

    // const WSS_ENDPOINT = 'wss://testnet.solana.com';
    // const HTTP_ENDPOINT = 'https://api.testnet.solana.com';

    this.solanaConnection = new Connection(HTTP_ENDPOINT, {
      wsEndpoint: WSS_ENDPOINT,
    });
  }

  async watchAccountBalance(): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(process.env.WALLET_ADDRESS);

    const balance = await this.solanaConnection.getBalance(ACCOUNT_TO_WATCH);
    console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL}`);
    return { balance: balance / LAMPORTS_PER_SOL };
  }

  async addAccountBalance(): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(process.env.WALLET_ADDRESS);

    await this.solanaConnection.requestAirdrop(
      ACCOUNT_TO_WATCH,
      LAMPORTS_PER_SOL,
    );

    console.log('Balance Added');
  }

  async subscribeToAccountChange(): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(process.env.WALLET_ADDRESS);
    const subscriptionId = await this.solanaConnection.onAccountChange(
      ACCOUNT_TO_WATCH,
      (updatedAccountInfo) => {
        console.log(
          `Event Notification for ${ACCOUNT_TO_WATCH.toString()} \nNew Account Balance:`,
          updatedAccountInfo.lamports / LAMPORTS_PER_SOL,
          ' SOL',
        );
      },
      'confirmed',
    );

    console.log('Starting web socket, subscription ID: ', subscriptionId);
  }

  // private sleep(ms: number): Promise<void> {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }
}
