import { Share } from 'react-native';
import Toast from 'react-native-toast-message';
import { IPost } from '../../../models/IPost';
import { useShareMessage } from './useShareMessage';

interface UsePostShareProps {
	post: IPost;
}

export function usePostShare({ post }: UsePostShareProps) {
	const { show: showShareMessage, trigger: triggerShareMessage } = useShareMessage(2000);

	const handleSharePress = async () => {
		try {
			const postUrl = `${post?.id}`;
			await Share.share({
				title: `Post de ${post.account.name ?? ''}`,
				message:
					post.content
						? `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}\n${postUrl}`
						: `Confira este post de ${post.account.name ?? ''}! ${postUrl}`,
			});
			triggerShareMessage();
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Erro ao compartilhar post',
				text2: 'Tente novamente mais tarde.',
				position: 'bottom',
			});
		}
	};

	return {
		showShareMessage,
		handleSharePress,
	};
}

