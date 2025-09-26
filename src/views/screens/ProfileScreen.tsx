import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AccountController } from '../../controllers/AccountController';
import { IAccount } from '../../models/Account';

const ProfileScreen = () => {
    const [account, setAccount] = useState<IAccount | null>(null);

    useEffect(() => {
        async function loadAccount() {
            const data = await AccountController.fetchAccount('68d04b30a546ba78cda5dd2a');
            setAccount(data);
        }
        loadAccount();
    }, []);

    if (!account) return <Text>Loading....</Text>;

    return (
        <View style={styles.container}>
            {account.avatar && (
                <Image source={{ uri: account.avatar }} style={styles.avatar} />
            )}
            <Text style={styles.name}>{account.name}</Text>
            <Text style={styles.email}>{account.email}</Text>
            <Text style={styles.phone}>{account.phone_number}</Text>
            <Text style={styles.role}>Role: {account.role}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
    name: { fontSize: 20, fontWeight: 'bold' },
    email: { fontSize: 16 },
    phone: { fontSize: 16 },
    role: { fontSize: 16, marginTop: 10 },
});

export default ProfileScreen;