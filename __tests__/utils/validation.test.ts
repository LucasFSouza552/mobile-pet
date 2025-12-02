import {
  validateEmail,
  validatePhone,
  validateCPF,
  validateCNPJ,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validateWeight,
  validateAge,
  validateCEP,
  validateRequired,
  validateLength,
} from '@/utils/validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      const result = validateEmail('usuario@email.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar email vazio', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email é obrigatório');
    });

    it('deve rejeitar email inválido sem @', () => {
      const result = validateEmail('usuarioemail.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido. Exemplo: usuario@email.com');
    });

    it('deve rejeitar email inválido sem domínio', () => {
      const result = validateEmail('usuario@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido. Exemplo: usuario@email.com');
    });

    it('deve aceitar email com espaços (trim)', () => {
      const result = validateEmail('  usuario@email.com  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefone válido com 10 dígitos', () => {
      const result = validatePhone('(11) 1234-5678');
      expect(result.isValid).toBe(true);
    });

    it('deve validar telefone válido com 11 dígitos', () => {
      const result = validatePhone('(11) 91234-5678');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar telefone vazio', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Telefone é obrigatório');
    });

    it('deve rejeitar telefone com menos de 10 dígitos', () => {
      const result = validatePhone('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Telefone deve ter pelo menos 10 dígitos');
    });

    it('deve rejeitar telefone com mais de 11 dígitos', () => {
      const result = validatePhone('123456789012');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Telefone deve ter no máximo 11 dígitos');
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF válido', () => {
      const result = validateCPF('111.444.777-35');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar CPF vazio', () => {
      const result = validateCPF('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF é obrigatório');
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      const result = validateCPF('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF deve ter 11 dígitos');
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      const result = validateCPF('111.111.111-11');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF inválido');
    });

    it('deve rejeitar CPF com dígitos verificadores inválidos', () => {
      const result = validateCPF('111.444.777-00');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CPF inválido');
    });
  });

  describe('validateCNPJ', () => {
    it('deve validar CNPJ válido', () => {
      const result = validateCNPJ('11.444.777/0001-61');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar CNPJ vazio', () => {
      const result = validateCNPJ('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CNPJ é obrigatório');
    });

    it('deve rejeitar CNPJ com menos de 14 dígitos', () => {
      const result = validateCNPJ('1234567890123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CNPJ deve ter 14 dígitos');
    });

    it('deve rejeitar CNPJ com todos dígitos iguais', () => {
      const result = validateCNPJ('11.111.111/1111-11');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CNPJ inválido');
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha válida', () => {
      const result = validatePassword('senha123');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar senha vazia', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha é obrigatória');
    });

    it('deve rejeitar senha muito curta', () => {
      const result = validatePassword('senha1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha deve ter no mínimo 8 caracteres');
    });

    it('deve rejeitar senha sem letras', () => {
      const result = validatePassword('12345678');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha deve conter letras e números');
    });

    it('deve rejeitar senha sem números', () => {
      const result = validatePassword('senhasenha');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Senha deve conter letras e números');
    });

    it('deve aceitar tamanho mínimo customizado', () => {
      const result = validatePassword('senha1', 6);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('deve validar confirmação correta', () => {
      const result = validatePasswordConfirmation('senha123', 'senha123');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar confirmação vazia', () => {
      const result = validatePasswordConfirmation('senha123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Confirmação de senha é obrigatória');
    });

    it('deve rejeitar confirmação diferente', () => {
      const result = validatePasswordConfirmation('senha123', 'senha456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('As senhas não coincidem');
    });
  });

  describe('validateName', () => {
    it('deve validar nome válido', () => {
      const result = validateName('João Silva');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar nome vazio', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nome é obrigatório');
    });

    it('deve rejeitar nome muito curto', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve rejeitar nome muito longo', () => {
      const longName = 'A'.repeat(101);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nome deve ter no máximo 100 caracteres');
    });

    it('deve rejeitar nome com caracteres inválidos', () => {
      const result = validateName('João123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nome contém caracteres inválidos');
    });

    it('deve aceitar nome com acentos e hífen', () => {
      const result = validateName('José da Silva-Santos');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateWeight', () => {
    it('deve validar peso válido', () => {
      const result = validateWeight('10.5');
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar vírgula como separador decimal', () => {
      const result = validateWeight('10,5');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar peso vazio', () => {
      const result = validateWeight('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Peso é obrigatório');
    });

    it('deve rejeitar peso inválido', () => {
      const result = validateWeight('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Peso deve ser um número válido');
    });

    it('deve rejeitar peso zero ou negativo', () => {
      const result = validateWeight('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Peso deve ser maior que zero');
    });

    it('deve rejeitar peso muito alto', () => {
      const result = validateWeight('201');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Peso deve ser menor que 200 kg');
    });
  });

  describe('validateAge', () => {
    it('deve validar idade válida', () => {
      const result = validateAge('5');
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar idade vazia quando não obrigatória', () => {
      const result = validateAge('', false);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar idade vazia quando obrigatória', () => {
      const result = validateAge('', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade é obrigatória');
    });

    it('deve rejeitar idade inválida', () => {
      const result = validateAge('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade deve ser um número válido');
    });

    it('deve rejeitar idade negativa', () => {
      const result = validateAge('-1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade não pode ser negativa');
    });

    it('deve rejeitar idade muito alta', () => {
      const result = validateAge('31');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade deve ser menor que 30 anos');
    });

    it('deve rejeitar idade decimal', () => {
      const result = validateAge('5.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Idade deve ser um número inteiro');
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEP válido', () => {
      const result = validateCEP('12345-678');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar CEP vazio', () => {
      const result = validateCEP('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CEP é obrigatório');
    });

    it('deve rejeitar CEP com menos de 8 dígitos', () => {
      const result = validateCEP('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CEP deve ter 8 dígitos');
    });

    it('deve rejeitar CEP com mais de 8 dígitos', () => {
      const result = validateCEP('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CEP deve ter 8 dígitos');
    });
  });

  describe('validateRequired', () => {
    it('deve validar campo preenchido', () => {
      const result = validateRequired('valor', 'Campo');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar campo vazio', () => {
      const result = validateRequired('', 'Campo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Campo é obrigatório');
    });

    it('deve rejeitar campo apenas com espaços', () => {
      const result = validateRequired('   ', 'Campo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Campo é obrigatório');
    });
  });

  describe('validateLength', () => {
    it('deve validar comprimento válido', () => {
      const result = validateLength('texto', 2, 10, 'Campo');
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar campo vazio', () => {
      const result = validateLength('', 2, 10, 'Campo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Campo é obrigatório');
    });

    it('deve rejeitar texto muito curto', () => {
      const result = validateLength('a', 2, 10, 'Campo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Campo deve ter pelo menos 2 caracteres');
    });

    it('deve rejeitar texto muito longo', () => {
      const result = validateLength('texto muito longo', 2, 10, 'Campo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Campo deve ter no máximo 10 caracteres');
    });
  });
});

