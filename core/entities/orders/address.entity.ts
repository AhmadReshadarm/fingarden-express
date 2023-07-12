import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Checkout } from './checkout.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @IsNotEmpty()
  @Column()
  receiverName: string;

  @IsNotEmpty()
  @Column()
  receiverPhone: string;

  @IsNotEmpty()
  @Column()
  address: string;

  @Column()
  roomOrOffice: string;

  @Column()
  door: string;

  @Column()
  floor: string;

  @Column()
  rignBell: string;

  @IsNotEmpty()
  @Column()
  zipCode: string;

  @OneToMany(() => Checkout, checkout => checkout.address)
  checkouts: Checkout[];

  constructor(args?: {
    receiverName: string;
    receiverPhone: string;
    address: string;
    roomOrOffice: string;
    door: string;
    floor: string;
    rignBell: string;
    zipCode: string;
  }) {
    if (args) {
      this.receiverName = args.receiverName;
      this.receiverPhone = args.receiverPhone;
      this.address = args.address;
      this.roomOrOffice = args.roomOrOffice;
      this.door = args.door;
      this.floor = args.floor;
      this.rignBell = args.rignBell;
      this.zipCode = args.zipCode;
    }
  }
}
