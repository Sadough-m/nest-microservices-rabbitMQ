import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'wallets',  // Optional: Specify the table name in the DB
  timestamps: false,      // Disable automatic timestamps (createdAt, updatedAt)
})
export class Wallet extends Model<Wallet> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.STRING,
  })
  @ApiProperty()
  address: string;

  @Column({
    type: DataType.FLOAT,  // Storing numerical values with floating points
    allowNull: false,
    defaultValue: 0,
  })
  @ApiProperty()
  total_profit: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  most_profitable_token: string;


  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  least_profitable_token: string;

  @Column({
    type: DataType.INTEGER,  // Storing whole number values for token trades
    allowNull: false,
    defaultValue: 0,
  })
  @ApiProperty()
  num_tokens_traded: number;

  @Column({
    type: DataType.INTEGER,  // Storing whole number values for active days
    allowNull: false,
    defaultValue: 0,
  })
  @ApiProperty()
  num_active_days: number;

  @Column({
    type: DataType.FLOAT,  // Floating point values for average trade volume
    allowNull: false,
    defaultValue: 0,
  })
  @ApiProperty()
  avg_trade_volume: number;

  @Column({
    type: DataType.NUMBER,  // Storing a risk assessment string value
    allowNull: false,        // Can be null if not always required
    defaultValue: 0,
  })
  @ApiProperty()
  risk_assessment: number;

  @Column({
    type: DataType.DATE,     // Storing date and time information
    allowNull: false,
    defaultValue: DataType.NOW,  // Automatically set current date and time
  })
  last_updated: Date;

}
