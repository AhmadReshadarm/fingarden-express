import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity()
export class Subscribe {

  @PrimaryGeneratedColumn()
  id: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  constructor(args?: { email: string }) {
    if (args) {
      this.email = args.email;
    }
  }
}
