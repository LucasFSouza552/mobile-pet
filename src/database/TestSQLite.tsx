import React, { useEffect, useState } from 'react';
import { getDBConnection, createTable, addAccount, getAccounts } from './db';
import { View, Text } from 'react-native';

export default function TestSQLite() {
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        async function initDB() {
            const db = await getDBConnection();
            await createTable(db);
            await addAccount(db, 'Leonardo', 'leo@example.com');
            const storedAccounts = await getAccounts(db);
            setAccounts(storedAccounts);
            console.log(storedAccounts);
        }

        initDB();
    }, []);

    return (
        <View>
            <Text>Accounts:</Text>
            {accounts.map((account) => (
                <Text key={account.id}>{account.name}</Text>
            ))}
        </View>
    );
}
