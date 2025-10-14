import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { databaseSchema } from './schema';
import { Account } from './models/account';

const adapter = new SQLiteAdapter({
    schema: databaseSchema,
    dbName: 'PetAppDB',
});

export const database = new Database({
    adapter,
    modelClasses: [Account]
});