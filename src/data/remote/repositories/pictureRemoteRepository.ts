import { API_URL } from '@env';
import { ImageSourcePropType } from "react-native";
import { Images } from "../../../../assets";

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
            return { uri: `${API_URL}/picture/${encodeURIComponent(pictureId)}` };
        } catch {
            return fallback;
        }
    }
}

