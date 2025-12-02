import { Result } from '@/src/shared/Result.js';
import { AppError } from '../errors/AppError.js';
import { OrderRepository } from './OrderRepository.js';

/**
 * Repositorios disponibles dentro de una Unit of Work
 */
export interface UnitOfWorkRepositories {
  orderRepository: OrderRepository;
}

/**
 * Unit of Work - Coordina transacciones de base de datos
 * Garantiza que todas las operaciones se ejecuten dentro de una única transacción
 */
export interface IUnitOfWork {
  /**
   * Ejecuta un bloque de trabajo dentro de una transacción
   * Si el resultado es Success, hace COMMIT
   * Si el resultado es Failure o hay excepción, hace ROLLBACK
   * 
   * @param work - Función que recibe los repositorios y retorna un Result
   * @returns Result con el valor o error
   */
  run<T>(
    work: (repos: UnitOfWorkRepositories) => Promise<Result<T, AppError>>
  ): Promise<Result<T, AppError>>;
}
