import { Injectable } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

@Injectable()
export class AppService {
  private solanaConnection: Connection;

  constructor() {
    // const WSS_ENDPOINT = process.env.WSS_ENDPOINT;
    // const HTTP_ENDPOINT = process.env.HTTP_ENDPOINT;

    // const WSS_ENDPOINT = 'wss://testnet.solana.com';
    const HTTP_ENDPOINT = 'https://api.testnet.solana.com';

    this.solanaConnection = new Connection(HTTP_ENDPOINT, 'confirmed');
  }

  async watchAccountBalance(walletAddress: any): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(walletAddress);
    const balance = await this.solanaConnection.getBalance(ACCOUNT_TO_WATCH);
    console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL}`);
    return { balance: balance / LAMPORTS_PER_SOL };
  }

  async addAccountBalance(walletAddress: any): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(walletAddress);

    await this.solanaConnection.requestAirdrop(
      ACCOUNT_TO_WATCH,
      LAMPORTS_PER_SOL,
    );

    console.log('Balance Added');
  }

  async subscribeToAccountChange(walletAddress: any): Promise<any> {
    const ACCOUNT_TO_WATCH = new PublicKey(walletAddress);
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

  async sendTransaction(): Promise<any> {
    const fromKeypair = Keypair.generate();
    const toKeypair = Keypair.generate();

    const airdropSignature = await this.solanaConnection.requestAirdrop(
      fromKeypair.publicKey,
      LAMPORTS_PER_SOL,
    );

    await this.solanaConnection.confirmTransaction(airdropSignature);

    console.log(
      (await this.solanaConnection.getBalance(fromKeypair.publicKey)) /
        LAMPORTS_PER_SOL,
    );
    const lamportsToSend = 1000000000 / 2;

    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toKeypair.publicKey,
        lamports: lamportsToSend,
      }),
    );

    const sign = await sendAndConfirmTransaction(
      this.solanaConnection,
      transferTransaction,
      [fromKeypair],
    );

    return {
      signature: sign,
    };
  }

  async subscribeToSignature(signature: string): Promise<void> {
    this.solanaConnection.onSignature(signature, (result) => {
      if (result.err) {
        console.error(
          'Transaction failed:',
          result.err,
          '\n' + 'Signature:',
          signature,
        );
      } else {
        console.log(
          'Transaction confirmed:',
          result,
          '\n' + 'Signature:',
          signature,
        );
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
