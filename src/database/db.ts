import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
    return SQLite.openDatabase({ name: 'mydb.db', location: 'default' });
};

export const createTable = async (db: SQLite.SQLiteDatabase) => {
    const query = `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone_number TEXT,
        cpf VARCHAR,
        cnpj VARCHAR,
        role TEXT CHECK(role IN ('admin', 'user', 'vet', 'staff')) NOT NULL DEFAULT 'user',
        verified INTEGER
    );
    `;
    await db.executeSql(query);
};

export const addAccount = async (db: SQLite.SQLiteDatabase, name: string, email: string) => {
    const insertQuery = `INSERT INTO accounts (name, email, verified) VALUES (?, ?, 1)`;
    await db.executeSql(insertQuery, [name, email]);
};

export const getAccounts = async (db: SQLite.SQLiteDatabase) => {
    const results = await db.executeSql('SELECT * FROM accounts');
    const accounts: any[] = [];
    results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
            accounts.push(result.rows.item(i));
        }
    });
    return accounts;
};
