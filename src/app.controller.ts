import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('play')
  async play() {
    // await this.appService.subscribeToAccountChange();
    await this.watchBalance();
  }

  @Post('add-balance')
  async addBalance() {
    await this.appService.addAccountBalance(process.env.WALLET_ADDRESS);
  }

  @Post('watch-balance')
  async watchBalance() {
    return await this.appService.watchAccountBalance(
      process.env.WALLET_ADDRESS,
    );
  }

  @Post('send-transaction')
  async sendTransaction() {
    const sendResult = await this.appService.sendTransaction();
    await this.appService.subscribeToSignature(sendResult.signature);
  }
}
