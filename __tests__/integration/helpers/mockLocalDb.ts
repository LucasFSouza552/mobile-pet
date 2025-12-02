/**
 * Mock do SQLite em memória para testes de integração
 * Simula operações CRUD básicas mantendo estado entre chamadas
 */

interface TableData {
  [tableName: string]: any[];
}

class MockLocalDb {
  private tables: TableData = {};

  async getAllAsync(query: string, params?: any[]): Promise<any[]> {
    const tableName = this.extractTableName(query);
    const table = this.tables[tableName] || [];
    
    // Se há WHERE clause, filtra os resultados
    if (query.includes('WHERE') && params && params.length > 0) {
      const whereClause = this.parseWhereClause(query, params);
      return table.filter(whereClause);
    }
    
    // Sempre retorna array, nunca undefined
    return Array.isArray(table) ? table : [];
  }

  async getFirstAsync(query: string, params?: any[]): Promise<any | null> {
    const tableName = this.extractTableName(query);
    const table = this.tables[tableName] || [];
    
    if (!Array.isArray(table) || table.length === 0) {
      return null;
    }
    
    if (query.includes('WHERE') && params && params.length > 0) {
      const whereClause = this.parseWhereClause(query, params);
      const result = table.find(whereClause);
      return result || null;
    }
    
    return table[0] || null;
  }

  async runAsync(query: string, params?: any[]): Promise<void> {
    const upperQuery = query.toUpperCase();
    
    if (upperQuery.includes('INSERT INTO')) {
      this.handleInsert(query, params || []);
    } else if (upperQuery.includes('UPDATE')) {
      this.handleUpdate(query, params || []);
    } else if (upperQuery.includes('DELETE FROM')) {
      this.handleDelete(query, params || []);
    }
    
    // Garante que a promise é resolvida
    return Promise.resolve();
  }

  async execAsync(sql: string): Promise<void> {
    return Promise.resolve();
  }

  private extractTableName(query: string): string {
    // Remove quebras de linha e espaços extras para facilitar o parsing
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
    
    const insertMatch = cleanQuery.match(/INSERT\s+INTO\s+(\w+)/i);
    if (insertMatch) return insertMatch[1];
    
    const selectMatch = cleanQuery.match(/FROM\s+(\w+)/i);
    if (selectMatch) return selectMatch[1];
    
    const updateMatch = cleanQuery.match(/UPDATE\s+(\w+)/i);
    if (updateMatch) return updateMatch[1];
    
    const deleteMatch = cleanQuery.match(/DELETE\s+FROM\s+(\w+)/i);
    if (deleteMatch) return deleteMatch[1];
    
    return 'unknown';
  }

  private handleInsert(query: string, params: any[]): void {
    const tableName = this.extractTableName(query);
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }

    // Remove quebras de linha e espaços extras para facilitar o parsing
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
    
    const columnMatch = cleanQuery.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
    if (!columnMatch) {
      console.warn('handleInsert: Não conseguiu extrair colunas da query:', query);
      return;
    }

    const columns = columnMatch[1].split(',').map(c => c.trim());
    const record: any = {};

    // Garante que temos params suficientes
    if (params.length < columns.length) {
      console.warn(`handleInsert: Params insuficientes. Esperado: ${columns.length}, Recebido: ${params.length}`);
    }

    columns.forEach((col, index) => {
      if (index < params.length) {
        record[col] = params[index];
      }
    });

    if (query.includes('ON CONFLICT')) {
      // Extrai a coluna de conflito (id ou email)
      const conflictMatch = query.match(/ON CONFLICT\s*\((\w+)\)/i);
      const conflictColumn = conflictMatch ? conflictMatch[1] : 'id';
      
      // Procura por conflito baseado na coluna especificada
      const existingIndex = this.tables[tableName].findIndex(
        (item: any) => {
          if (conflictColumn === 'email') {
            return item.email === record.email;
          }
          return item.id === record.id;
        }
      );
      
      if (existingIndex >= 0) {
        // Captura tudo após DO UPDATE SET até o final da query (incluindo quebras de linha)
        const updateMatch = query.match(/DO UPDATE SET\s+([\s\S]+)/i);
        if (updateMatch) {
          const updateClause = updateMatch[1].trim();
          const updates = this.parseUpdateClause(updateClause, params, record);
          // Atualiza o registro existente com os novos valores
          this.tables[tableName][existingIndex] = {
            ...this.tables[tableName][existingIndex],
            ...updates,
          };
        }
      } else {
        this.tables[tableName].push(record);
      }
    } else {
      this.tables[tableName].push(record);
    }
  }

  private handleUpdate(query: string, params: any[]): void {
    const tableName = this.extractTableName(query);
    if (!this.tables[tableName]) return;

    const whereMatch = query.match(/WHERE\s+(.+)/i);
    if (!whereMatch) return;

    const whereClause = this.parseWhereClause(query, params);
    const updateMatch = query.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
    if (!updateMatch) return;

    const updates = this.parseUpdateClause(updateMatch[1], params, undefined);

    this.tables[tableName] = this.tables[tableName].map((item: any) => {
      if (whereClause(item)) {
        return { ...item, ...updates };
      }
      return item;
    });
  }

  private handleDelete(query: string, params: any[]): void {
    const tableName = this.extractTableName(query);
    if (!this.tables[tableName]) return;

    // Se não há WHERE clause, remove todos os registros (DELETE FROM table)
    if (!query.includes('WHERE')) {
      this.tables[tableName] = [];
      return;
    }

    const whereClause = this.parseWhereClause(query, params);
    
    this.tables[tableName] = this.tables[tableName].filter(
      (item: any) => !whereClause(item)
    );
  }

  private parseWhereClause(query: string, params: any[]): (item: any) => boolean {
    const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s*$)/i);
    if (!whereMatch) return () => true;

    const whereStr = whereMatch[1].trim();
    
    // Simple WHERE column = ? (pode ter ORDER BY depois)
    const idMatch = whereStr.match(/(\w+)\s*=\s*\?/);
    if (idMatch && params.length > 0) {
      const column = idMatch[1];
      const value = params[0];
      return (item: any) => item[column] === value;
    }

    // WHERE column1 = ? AND column2 = ?
    const andMatch = whereStr.match(/(\w+)\s*=\s*\?\s+AND\s+(\w+)\s*=\s*\?/i);
    if (andMatch && params.length >= 2) {
      const column1 = andMatch[1];
      const column2 = andMatch[2];
      const value1 = params[0];
      const value2 = params[1];
      return (item: any) => item[column1] === value1 && item[column2] === value2;
    }

    return () => true;
  }

  private parseUpdateClause(updateStr: string, params: any[], newRecord?: any): any {
    const updates: any = {};
    // Divide por vírgula, mas considera que pode haver quebras de linha
    const parts = updateStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    parts.forEach((part) => {
      // Regex para capturar: coluna = valor
      // Exemplo: "name = excluded.name" ou "id = excluded.id"
      const match = part.match(/(\w+)\s*=\s*(.+)/);
      if (match) {
        const column = match[1].trim();
        const valueExpr = match[2].trim();
        
        if (valueExpr.startsWith('excluded.')) {
          const excludedCol = valueExpr.replace(/^excluded\./, '').trim();
          // excluded. se refere ao novo registro que está sendo inserido (record)
          // O record foi criado a partir dos params na ordem das colunas
          if (newRecord && excludedCol in newRecord) {
            updates[column] = newRecord[excludedCol];
          } else {
            // Se não encontrar, tenta usar o valor do record original
            updates[column] = newRecord?.[excludedCol] ?? null;
          }
        } else if (valueExpr === '?') {
          // Para valores ?, tenta usar o newRecord
          if (newRecord && column in newRecord) {
            updates[column] = newRecord[column];
          }
        } else {
          // Valor literal (remove aspas se houver)
          const cleanValue = valueExpr.replace(/^['"]|['"]$/g, '');
          updates[column] = cleanValue;
        }
      }
    });

    return updates;
  }

  clear(): void {
    this.tables = {};
  }

  reset(): void {
    this.clear();
  }

  setTableData(tableName: string, data: any[]): void {
    this.tables[tableName] = data;
  }

  getTableData(tableName: string): any[] {
    return this.tables[tableName] || [];
  }

  // Método getAll() que sempre retorna array, nunca undefined
  getAll(tableName: string): any[] {
    return this.tables[tableName] ?? [];
  }

  // Método de debug para verificar estado interno
  getTables(): TableData {
    return { ...this.tables };
  }
}

let mockDbInstance: MockLocalDb | null = null;

export function getMockLocalDb(): MockLocalDb {
  if (!mockDbInstance) {
    mockDbInstance = new MockLocalDb();
  }
  return mockDbInstance;
}

export function resetMockLocalDb(): void {
  mockDbInstance = new MockLocalDb();
}

