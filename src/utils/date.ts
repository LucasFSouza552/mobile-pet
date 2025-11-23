export type DateFormatStyle = 'short' | 'long' | 'compact';

export interface FormatDateOptions {
	style?: DateFormatStyle;
	includeYear?: boolean;
}

export function formatDate(dateString?: string, options?: FormatDateOptions): string {
	if (!dateString) return '';
	
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const style = options?.style || 'long';
	
	if (diffInSeconds < 60) {
		return style === 'compact' ? 'Agora' : 'agora';
	}
	
	if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		if (style === 'compact') {
			return `${minutes} min atrás`;
		}
		return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
	}
	
	if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		if (style === 'compact') {
			return `${hours}h atrás`;
		}
		return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
	}
	
	if (diffInSeconds < 604800) {
		const days = Math.floor(diffInSeconds / 86400);
		if (style === 'compact') {
			return `${days}d atrás`;
		}
		return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
	}
	
	const includeYear = options?.includeYear ?? (date.getFullYear() !== now.getFullYear());
	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: style === 'long' ? 'long' : 'short',
		year: includeYear ? 'numeric' : undefined,
	} as any);
}

export function formatDayLabel(dateString?: string): string {
	if (!dateString) return 'Sem data';
	
	const date = new Date(dateString);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	
	const dateStr = date.toDateString();
	const todayStr = today.toDateString();
	const yesterdayStr = yesterday.toDateString();
	
	if (dateStr === todayStr) return 'Hoje';
	if (dateStr === yesterdayStr) return 'Ontem';
	
	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});
}

export function formatHour(dateString?: string): string {
	if (!dateString) return '';
	return new Date(dateString).toLocaleTimeString('pt-BR', {
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatDateTime(dateString?: string): string {
	if (!dateString) return '';
	return new Date(dateString).toLocaleString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function formatDateOnly(dateString?: string, includeYear: boolean = true): string {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: includeYear ? 'numeric' : undefined,
	});
}


