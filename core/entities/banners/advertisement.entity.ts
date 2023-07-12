import { Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Min, Max, IsNotEmpty } from 'class-validator';

@Entity()
export class Advertisement {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  image: string;

  @IsNotEmpty()
  @Column('text')
  description: string;

  @IsNotEmpty()
  @Column()
  link: string;

  constructor(args?: { image: string, description: string, link: string }) {
    if (args) {
      this.image = args.image;
      this.description = args.description;
      this.link = args.link;
    }
  }
}
