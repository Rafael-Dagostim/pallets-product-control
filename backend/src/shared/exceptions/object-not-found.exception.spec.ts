import { NotFoundException } from '@nestjs/common';
import { ObjectNotFoundException } from './object-not-found.exception';

describe('ObjectNotFoundException', () => {
  it('should extend NotFoundException', () => {
    const exception = new ObjectNotFoundException('Usuário');
    expect(exception).toBeInstanceOf(NotFoundException);
  });

  it('should format message without reference field', () => {
    const exception = new ObjectNotFoundException('Usuário');
    expect(exception.message).toBe('Usuário não encontrado(a)');
  });

  it('should format message with reference field and value', () => {
    const exception = new ObjectNotFoundException('Usuário', 'id', 'abc-123');
    expect(exception.message).toBe(
      'Usuário com id igual à abc-123 não encontrado(a)',
    );
  });
});
