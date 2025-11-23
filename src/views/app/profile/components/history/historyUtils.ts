import { IHistory } from '../../../../../models/IHistory';

export const TYPE_META = {
  adoption: { label: 'Adoção', icon: 'paw' as const, accent: '#8b5cf6' },
  donation: { label: 'Doação', icon: 'hand-holding-heart' as const, accent: '#f59e0b' },
  sponsorship: { label: 'Patrocínio', icon: 'handshake' as const, accent: '#0ea5e9' },
} as const;

export const STATUS_META = {
  pending: { label: 'Pendente', text: '#92400e', bg: '#fef3c7' },
  completed: { label: 'Concluído', text: '#166534', bg: '#dcfce7' },
  cancelled: { label: 'Cancelado', text: '#991b1b', bg: '#fee2e2' },
  refunded: { label: 'Reembolsado', text: '#0f172a', bg: '#e0f2fe' },
} as const;

export const formatCurrency = (value: string | number | undefined): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getPetName = (entry: IHistory): string | null => {
  const pet = entry.pet;
  if (typeof pet === 'object' && pet !== null) {
    return pet.name || null;
  }
  return null;
};

const getInstitutionName = (entry: IHistory): string | null => {
  const institution = entry.institution;
  if (typeof institution === 'object' && institution !== null) {
    return institution.name || null;
  }
  return null;
};

export const getHistoryDescription = (entry: IHistory): string => {
  const petName = getPetName(entry);
  const institutionName = getInstitutionName(entry);

  switch (entry.type) {
    case 'adoption':
      if (entry.status === 'completed') {
        return petName ? `Adoção de ${petName} concluída` : 'Adoção concluída';
      }
      return petName ? `Solicitação de adoção para ${petName}` : 'Solicitação de adoção enviada';
    
    case 'donation':
      return entry.amount ? 'Doação para o PetAmigo' : 'Contribuiu com a causa';
    
    case 'sponsorship':
      return institutionName
        ? `Patrocínio para ${institutionName}`
        : 'Patrocínio para instituição';
    
    default:
      return 'Registro de atividade';
  }
};

export const getTypeMeta = (type: IHistory['type']) => {
  return TYPE_META[type] ?? { label: 'Atividade', icon: 'history' as const, accent: '#666' };
};

export const getStatusMeta = (status?: string) => {
  if (!status) return STATUS_META.pending;
  return STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.pending;
};

