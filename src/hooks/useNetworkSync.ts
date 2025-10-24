import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";

export function useNetworkSync() {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            console.log(state);
        });

        return () => unsubscribe();
    }, []);
}
