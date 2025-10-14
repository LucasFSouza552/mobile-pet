// src/database/models/Account.ts
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class Account extends Model {
  static table = 'accounts';

  @field('name') name!: string;
  @field('email') email!: string;
  @field('avatar') avatar?: string;
  @field('phone_number') phoneNumber!: string;
  @field('role') role!: string;
  @field('cpf') cpf?: string;
  @field('cnpj') cnpj?: string;
  @field('verified') verified!: boolean;
  @field('address') address!: string;
  @field('createdAt') createdAt!: string;
  @field('updatedAt') updatedAt!: string;
}
