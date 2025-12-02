import buildQuery from '@/utils/BuilderQuery';

describe('BuilderQuery', () => {
  it('deve retornar string vazia quando não há parâmetros', () => {
    expect(buildQuery({})).toBe('');
  });

  it('deve construir query string simples', () => {
    const params = { page: '1', limit: '10' };
    const result = buildQuery(params);
    expect(result).toBe('?page=1&limit=10');
  });

  it('deve ignorar valores undefined', () => {
    const params = { page: '1', limit: undefined, sort: 'asc' };
    const result = buildQuery(params);
    expect(result).toBe('?page=1&sort=asc');
  });

  it('deve ignorar valores null', () => {
    const params = { page: '1', limit: null, sort: 'asc' };
    const result = buildQuery(params);
    expect(result).toBe('?page=1&sort=asc');
  });

  it('deve codificar valores corretamente', () => {
    const params = { search: 'test query', filter: 'a&b' };
    const result = buildQuery(params);
    expect(result).toBe('?search=test%20query&filter=a%26b');
  });

  it('deve codificar chaves corretamente', () => {
    const params = { 'user name': 'john', 'email@domain': 'test' };
    const result = buildQuery(params);
    expect(result).toContain('user%20name');
    expect(result).toContain('email%40domain');
  });

  it('deve lidar com números', () => {
    const params = { page: 1, limit: 10 };
    const result = buildQuery(params);
    expect(result).toBe('?page=1&limit=10');
  });

  it('deve lidar com booleanos', () => {
    const params = { active: true, deleted: false };
    const result = buildQuery(params);
    expect(result).toBe('?active=true&deleted=false');
  });
});

