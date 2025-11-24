import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { IPost } from '../../../models/IPost';
import { useShareMessage } from './useShareMessage';
import { useToast } from '../../../hooks/useToast';
import Constants from 'expo-constants';
import { API_URL } from '@env';
import { IAccount } from '../../../models/IAccount';

interface UsePostShareProps {
	post: IPost;
}

function getPostUrl(postId: string): string {
	const baseUrl = (API_URL && API_URL.trim().length > 0)
		? API_URL.replace('/api', '')
		: (Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'https://myPet.com.br');
	return `${baseUrl}/post/${postId}`;
}

function isAccount(value: IAccount | string): value is IAccount {
	return typeof value !== "string" && 
		   typeof value === "object" && 
		   value !== null && 
		   "name" in value;
}

function getAccountName(account: IAccount | string): string {
	if (isAccount(account)) {
		return account.name || 'Alguém';
	}
	return 'Alguém';
}

function formatShareMessage(post: IPost, includeUrl: boolean = true): string {
	const authorName = getAccountName(post.account);
	const content = post.content || '';
	const url = includeUrl ? getPostUrl(post.id) : '';

	let message = `📱 Post de ${authorName}\n\n`;

	if (content) {
		const maxLength = 200;
		const truncatedContent = content.length > maxLength
			? `${content.substring(0, maxLength)}...`
			: content;
		message += `${truncatedContent}\n\n`;
	}

	if (includeUrl && url) {
		message += `🔗 ${url}`;
	}

	return message;
}

export function usePostShare({ post }: UsePostShareProps) {
	const { show: showShareMessage, trigger: triggerShareMessage } = useShareMessage(2000);
	const toast = useToast();

	const handleSharePress = async () => {
		try {
			const message = formatShareMessage(post, true);
			const title = `Post de ${getAccountName(post.account)}`;

			const shareOptions: any = {
				title,
				message,
			};

			if (post.image && post.image.length > 0 && post.image[0]) {
				if (Platform.OS === 'android') {
					shareOptions.url = post.image[0];
				}
			}

			const result = await Share.share(shareOptions);

			if (result.action === Share.sharedAction) {
				triggerShareMessage();
				toast.success('Compartilhado!', 'Post compartilhado com sucesso');
			} else if (result.action === Share.dismissedAction) {
			}
		} catch (error: any) {
			if (error?.message?.includes('User did not share') || error?.message?.includes('cancel')) {
				return;
			}
			console.error('Erro ao compartilhar:', error);
			toast.error('Erro', 'Não foi possível compartilhar o post');
		}
	};

	const handleCopyLink = async () => {
		try {
			const url = getPostUrl(post.id);
			await Clipboard.setStringAsync(url);
			toast.success('Link copiado!', 'Link do post copiado para a área de transferência');
		} catch (error) {
			console.error('Erro ao copiar link:', error);
			toast.error('Erro', 'Não foi possível copiar o link');
		}
	};

	return {
		showShareMessage,
		handleSharePress,
		handleCopyLink,
		getPostUrl: () => getPostUrl(post.id),
	};
}



