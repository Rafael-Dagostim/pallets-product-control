import { NotFoundException } from '@nestjs/common';

export class ObjectNotFoundException extends NotFoundException {
  constructor(
    entityOrObjectName: string,
    referenceField?: string,
    referenceValue?: unknown,
  ) {
    const message =
      referenceField && referenceValue
        ? `${entityOrObjectName} com ${referenceField} igual à ${referenceValue} não encontrado(a)`
        : `${entityOrObjectName} não encontrado(a)`;
    super(message);
  }
}
