import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const databaseSchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'accounts',
            columns: [
                { name: 'id', type: 'string'},
                { name: 'name', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'avatar', type: 'string', isOptional: true },
                { name: 'phone_number', type: 'string'},
                { name: 'role', type: 'string' },
                { name: 'cpf', type: 'string', isOptional: true },
                { name: 'cnpj', type: 'string', isOptional: true },
                { name: 'verified', type: 'boolean'},
                { name: 'address', type: 'string' },
                { name: 'createdAt', type: 'string' },
                { name: 'updatedAt', type: 'string' },
            ]
        })
    ],
});