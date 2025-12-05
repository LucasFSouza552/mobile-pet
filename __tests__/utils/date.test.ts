import {
  formatDate,
  formatDayLabel,
  formatHour,
  formatDateTime,
  formatDateOnly,
} from '@/utils/date';

describe('date utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDate', () => {
    it('deve retornar string vazia para data inválida', () => {
      expect(formatDate()).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('deve retornar "agora" para data muito recente', () => {
      const now = new Date().toISOString();
      expect(formatDate(now)).toBe('agora');
    });

    it('deve retornar "Agora" no estilo compact', () => {
      const now = new Date().toISOString();
      expect(formatDate(now, { style: 'compact' })).toBe('Agora');
    });

    it('deve formatar minutos atrás', () => {
      const date = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const result = formatDate(date);
      expect(result).toContain('minutos');
    });

    it('deve formatar horas atrás', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const result = formatDate(date);
      expect(result).toContain('horas');
    });

    it('deve formatar dias atrás', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatDate(date);
      expect(result).toContain('dias');
    });

    it('deve formatar data completa para datas antigas', () => {
      const date = new Date('2024-01-01').toISOString();
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}/);
    });

    it('deve incluir ano quando includeYear é true', () => {
      const date = new Date('2023-12-31').toISOString();
      const result = formatDate(date, { includeYear: true });
      expect(result).toMatch(/\d{4}/);
    });
  });

  describe('formatDayLabel', () => {
    it('deve retornar "Sem data" para data inválida', () => {
      expect(formatDayLabel()).toBe('Sem data');
      expect(formatDayLabel('')).toBe('Sem data');
    });

    it('deve retornar "Hoje" para data de hoje', () => {
      const today = new Date().toISOString();
      expect(formatDayLabel(today)).toBe('Hoje');
    });

    it('deve retornar "Ontem" para data de ontem', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatDayLabel(yesterday)).toBe('Ontem');
    });

    it('deve formatar data completa para outras datas', () => {
      const date = new Date('2023-12-25').toISOString();
      const result = formatDayLabel(date);
      expect(result).toMatch(/dezembro|25|2023/);
    });
  });

  describe('formatHour', () => {
    it('deve retornar string vazia para data inválida', () => {
      expect(formatHour()).toBe('');
      expect(formatHour('')).toBe('');
    });

    it('deve formatar hora corretamente', () => {
      const date = new Date('2024-01-15T14:30:00Z').toISOString();
      const result = formatHour(date);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateTime', () => {
    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateTime()).toBe('');
      expect(formatDateTime('')).toBe('');
    });

    it('deve formatar data e hora corretamente', () => {
      const date = new Date('2024-01-15T14:30:00Z').toISOString();
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateOnly', () => {
    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateOnly()).toBe('');
      expect(formatDateOnly('')).toBe('');
    });

    it('deve formatar apenas data com ano por padrão', () => {
      const date = new Date('2024-01-15').toISOString();
      const result = formatDateOnly(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve formatar data sem ano quando includeYear é false', () => {
      const date = new Date('2024-01-15').toISOString();
      const result = formatDateOnly(date, false);
      expect(result).toMatch(/\d{2}\/\d{2}/);
      expect(result).not.toContain('2024');
    });
  });
});

