import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Parameter } from './parameter.entity';
import { IsNotEmpty } from 'class-validator';
import { Product } from './product.entity';

@Tree('closure-table')
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @Column()
  desc: string;

  @Column({ default: '' })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children: Category[];

  @OneToMany(() => Parameter, parameter => parameter.category)
  parameters: Parameter[];

  @IsNotEmpty()
  @Column({ unique: true })
  url: string;

  @OneToMany(() => Product, product => product.brand)
  products?: Product[];

  constructor(args?: {
    name: string;
    desc: string;
    image: string;
    parent?: Category;
    url: string;
    parameters: Parameter[];
  }) {
    if (args) {
      this.name = args.name;
      this.desc = args.desc;
      this.image = args.image;
      this.url = args.url;
      this.parent = args.parent;
      this.parameters = args.parameters;
    }
  }
}
