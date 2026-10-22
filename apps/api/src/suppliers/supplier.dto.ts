import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { EmptyToUndefined, Trim } from '../common/validation/decorators.js';

export class CreateSupplierDto {
  /** @example "Amanco" */
  @Trim()
  @Length(2, 120, {
    message: 'O nome do fornecedor deve ter entre 2 e 120 caracteres.',
  })
  @IsString({ message: 'Informe o nome do fornecedor.' })
  name: string;

  /** CNPJ, com ou sem pontuação. @example "12.345.678/0001-90" */
  @EmptyToUndefined()
  @Trim()
  @IsOptional()
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, {
    message: 'CNPJ inválido.',
  })
  taxId?: string;
}

export class ListSuppliersQuery {
  /** Busca por nome (sem diferenciar maiúsculas). @example "voto" */
  @EmptyToUndefined()
  @Trim()
  @IsOptional()
  @Length(1, 120)
  @IsString()
  q?: string;
}
