import sortDateDesc from '@/utils/SortDate';

describe('SortDate', () => {
  it('deve retornar array vazio quando recebe array vazio', () => {
    expect(sortDateDesc([])).toEqual([]);
  });

  it('deve retornar array com um elemento quando recebe array com um elemento', () => {
    const data = [{ id: 1, createdAt: '2024-01-01' }];
    expect(sortDateDesc(data)).toEqual(data);
  });

  it('deve ordenar por data descendente', () => {
    const data = [
      { id: 1, createdAt: '2024-01-01' },
      { id: 2, createdAt: '2024-01-03' },
      { id: 3, createdAt: '2024-01-02' },
    ];
    const result = sortDateDesc(data);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it('deve ordenar por data descendente com objetos Date', () => {
    const data = [
      { id: 1, createdAt: new Date('2024-01-01') },
      { id: 2, createdAt: new Date('2024-01-03') },
      { id: 3, createdAt: new Date('2024-01-02') },
    ];
    const result = sortDateDesc(data);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it('deve tratar itens sem createdAt como data 0', () => {
    const data = [
      { id: 1, createdAt: '2024-01-01' },
      { id: 2 },
      { id: 3, createdAt: '2024-01-02' },
    ];
    const result = sortDateDesc(data);
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(2);
  });

  it('deve não modificar array original', () => {
    const data = [
      { id: 1, createdAt: '2024-01-01' },
      { id: 2, createdAt: '2024-01-02' },
    ];
    const original = [...data];
    sortDateDesc(data);
    expect(data).toEqual(original);
  });

  it('deve retornar array quando recebe array com menos de 2 elementos', () => {
    const data = [{ id: 1, createdAt: '2024-01-01' }];
    expect(sortDateDesc(data)).toEqual(data);
  });
});

