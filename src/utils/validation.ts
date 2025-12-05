export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Email inválido. Exemplo: usuario@email.com' };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Telefone é obrigatório' };
  }

  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length < 10) {
    return { isValid: false, error: 'Telefone deve ter pelo menos 10 dígitos' };
  }

  if (numbers.length > 11) {
    return { isValid: false, error: 'Telefone deve ter no máximo 11 dígitos' };
  }

  return { isValid: true };
}

export function validateCPF(cpf: string): ValidationResult {
  if (!cpf || !cpf.trim()) {
    return { isValid: false, error: 'CPF é obrigatório' };
  }

  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }

  if (/^(\d)\1{10}$/.test(numbers)) {
    return { isValid: false, error: 'CPF inválido' };
  }

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  return { isValid: true };
}

export function validateCNPJ(cnpj: string): ValidationResult {
  if (!cnpj || !cnpj.trim()) {
    return { isValid: false, error: 'CNPJ é obrigatório' };
  }

  const numbers = cnpj.replace(/\D/g, '');

  if (numbers.length !== 14) {
    return { isValid: false, error: 'CNPJ deve ter 14 dígitos' };
  }

  if (/^(\d)\1{13}$/.test(numbers)) {
    return { isValid: false, error: 'CNPJ inválido' };
  }

  let length = numbers.length - 2;
  let digits = numbers.substring(0, length);
  const checkDigits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(0))) {
    return { isValid: false, error: 'CNPJ inválido' };
  }

  length = length + 1;
  digits = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(digits.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(1))) {
    return { isValid: false, error: 'CNPJ inválido' };
  }

  return { isValid: true };
}

export function validatePassword(password: string, minLength: number = 8): ValidationResult {
  if (!password || !password.trim()) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Senha deve ter no mínimo ${minLength} caracteres` };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Senha deve conter letras e números' };
  }

  return { isValid: true };
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword || !confirmPassword.trim()) {
    return { isValid: false, error: 'Confirmação de senha é obrigatória' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'As senhas não coincidem' };
  }

  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Nome deve ter no máximo 100 caracteres' };
  }

  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: 'Nome contém caracteres inválidos' };
  }

  return { isValid: true };
}

export function validateWeight(weight: string): ValidationResult {
  if (!weight || !weight.trim()) {
    return { isValid: false, error: 'Peso é obrigatório' };
  }

  const weightValue = Number(weight.replace(',', '.'));
  
  if (isNaN(weightValue)) {
    return { isValid: false, error: 'Peso deve ser um número válido' };
  }

  if (weightValue <= 0) {
    return { isValid: false, error: 'Peso deve ser maior que zero' };
  }

  if (weightValue > 200) {
    return { isValid: false, error: 'Peso deve ser menor que 200 kg' };
  }

  return { isValid: true };
}

export function validateAge(age: string, required: boolean = false): ValidationResult {
  if (!age || !age.trim()) {
    if (required) {
      return { isValid: false, error: 'Idade é obrigatória' };
    }
    return { isValid: true };
  }

  const ageValue = Number(age);
  
  if (isNaN(ageValue)) {
    return { isValid: false, error: 'Idade deve ser um número válido' };
  }

  if (ageValue < 0) {
    return { isValid: false, error: 'Idade não pode ser negativa' };
  }

  if (ageValue > 30) {
    return { isValid: false, error: 'Idade deve ser menor que 30 anos' };
  }

  if (!Number.isInteger(ageValue)) {
    return { isValid: false, error: 'Idade deve ser um número inteiro' };
  }

  return { isValid: true };
}

export function validateCEP(cep: string): ValidationResult {
  if (!cep || !cep.trim()) {
    return { isValid: false, error: 'CEP é obrigatório' };
  }

  const numbers = cep.replace(/\D/g, '');

  if (numbers.length !== 8) {
    return { isValid: false, error: 'CEP deve ter 8 dígitos' };
  }

  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} é obrigatório` };
  }
  return { isValid: true };
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} é obrigatório` };
  }

  const length = value.trim().length;

  if (length < min) {
    return { isValid: false, error: `${fieldName} deve ter pelo menos ${min} caracteres` };
  }

  if (length > max) {
    return { isValid: false, error: `${fieldName} deve ter no máximo ${max} caracteres` };
  }

  return { isValid: true };
}

