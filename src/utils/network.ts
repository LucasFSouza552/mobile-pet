import NetInfo from "@react-native-community/netinfo";

let networkCache: { isConnected: boolean; timestamp: number } | null = null;
const NETWORK_CACHE_DURATION = 2000;

export async function isNetworkConnected(): Promise<boolean> {
    const now = Date.now();
    
    if (networkCache && (now - networkCache.timestamp) < NETWORK_CACHE_DURATION) {
        return networkCache.isConnected;
    }
    
    try {
        const netState = await NetInfo.fetch();
        const connected = netState.isConnected ?? false;
        
        networkCache = { 
            isConnected: connected, 
            timestamp: now 
        };
        
        return connected;
    } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        return networkCache?.isConnected ?? false;
    }
}

export function clearNetworkCache(): void {
    networkCache = null;
}
