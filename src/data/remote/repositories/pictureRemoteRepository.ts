import { ImageSourcePropType } from "react-native";
import { Images } from "../../../../assets";
import { API_URL } from "@env";
import Constants from 'expo-constants';

const BASE_URL = (API_URL && API_URL.trim().length > 0)
    ? API_URL
    : (Constants.expoConfig?.extra?.API_URL || "http://10.0.2.2:3000/api");

export const pictureRepository = {
    getSource(pictureId: string | undefined): ImageSourcePropType {
        const fallback = Images.avatarDefault;
        try {
            if (!pictureId) {
                return fallback;
            }
            const urlRegex = /^https?:\/\S*$/;
            if (urlRegex.test(pictureId)) {
                return { uri: pictureId };
            }
            return { uri: `${BASE_URL}/picture/${encodeURIComponent(pictureId)}` };
        } catch {
            return fallback;
        }
    }
}

