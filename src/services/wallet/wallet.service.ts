import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet } from './wallet.model';
import { WalletsQueryDto } from './dto/wallet.dto';
import { plainToClass } from 'class-transformer';
import { RabbitMQService } from '../../common/rabbitMQ.service';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class WalletService implements OnModuleInit {
  constructor(
    @InjectModel(Wallet)
    private readonly wallet: typeof Wallet,
    private readonly rabbitMQService: RabbitMQService,
    private sequelize: Sequelize,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.connect();

    await this.rabbitMQService.consumeQueue('/wallets', (msg) => {
      return this.getAll();
    });
    await this.rabbitMQService.consumeQueue('/wallets:id', async (msg) => {
      return await this.get(msg.address);
    });
    await this.rabbitMQService.consumeQueue('/wallets/top-tokens/', async (msg) => {
      const [results] = await this.getTopTokens();
      return results[0];
    });

  }

  async getTopTokens() {
    return await this.sequelize.query(`
Select w.most_profitable_token, count(*) as count
From public.wallets as w
Where w.most_profitable_token IS NOT NULL
Group By w.most_profitable_token
Order By count Desc
Limit 1`);
  }

  async get(address: string): Promise<Wallet | undefined> {
    return this.wallet.findOne({ where: { address: address } });
  }

  async getAll(): Promise<Wallet[]> {
    return this.wallet.findAll();
  }

  async bulkCreateWallet(wallets: any[]) {
    // console.log('wallets',wallets)
    const columnsToUpdate: (keyof Wallet)[] = Object.keys(this.wallet.getAttributes()).filter(attr => attr !== 'address') as (keyof Wallet)[]; // Exclude primary key

    return await this.wallet.bulkCreate(
      wallets,
      {
        validate: true,
        updateOnDuplicate: columnsToUpdate, // Specify the columns to update if the row exists
      },
    );
  }

  analyzeData(rawData: []): any[] {
    // console.log('rawData', rawData.filter((x: any) => x.walletAddress === '0xa4dbe6bc0748202fa1ce6b81a42c563fe9b06757'));

    const totalTokens = rawData.reduce((acc, cur: any, ind) => {
      acc = [...new Set([...cur['HotTokenHolders'].map(x => x.tokenName), ...acc])];
      return acc;
    }, []).length;
    // console.log('totalTokens', totalTokens);
    let test = rawData.map((wallet: any) => {
      const total_profit = wallet['HotTokenHolders'].reduce((acc, cur) => acc = acc + cur['Profit'], 0);
      const most_profitable_token = wallet['HotTokenHolders'].reduce((acc, cur, ind) => {
        if (ind === 0)
          acc = { profit: cur['Profit'], name: cur.tokenName };
        else
          acc.profit < cur['Profit'] && (acc = { profit: cur['Profit'], name: cur.tokenName });
        return acc;
      }, {}).name;
      const least_profitable_token = wallet['HotTokenHolders'].reduce((acc, cur, ind) => {
        if (ind === 0)
          acc = { profit: cur['Profit'], name: cur.tokenName };
        else
          acc.profit > cur['Profit'] && (acc = { profit: cur['Profit'], name: cur.tokenName });
        return acc;
      }, {}).name;
      const num_tokens_traded = [...new Set(wallet['HotTokenHolders'].map(x => x.tokenName))].length;
      const num_active_days = wallet.dayActive;
      const risk_assessment = (1 - (num_tokens_traded / totalTokens)) * 100;
      const totalWalletTransaction = wallet['HotTokenHolders'].reduce((acc, cur) => {return acc += cur['Buy Amount (USD)'] + cur['Sell Amount (USD)'];}, 0);
      const avg_trade_volume = totalWalletTransaction / wallet.totalTransactions;
      return { address: wallet.walletAddress, total_profit, most_profitable_token, least_profitable_token, num_tokens_traded, num_active_days, risk_assessment, avg_trade_volume, last_updated: (new Date()).toISOString() };
    });
    // console.log('test',test)
    return Array.from(new Map(test.map(item => [item.address, item])).values());

  }

  walletSort(wallets: Wallet[], query: WalletsQueryDto): Wallet[] {
    const { order, sort_by } = query;
    return wallets.sort((a, b) => {
      return order === 'asc' ? a[sort_by] > b[sort_by] ? 1 : -1 : a[sort_by] < b[sort_by] ? 1 : -1;
    });
  }
}
