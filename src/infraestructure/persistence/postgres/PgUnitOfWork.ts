import { Pool, PoolClient } from 'pg';
import { IUnitOfWork, UnitOfWorkRepositories } from '../../../application/ports/UnitOfWork.js';
import { PostgresOrderRepository } from './PostgresOrderRepository.js';
import { Result, ok, err } from '@/src/shared/Result.js';
import { AppError, InfraError } from '../../../application/errors/AppError.js';

export class PgUnitOfWork implements IUnitOfWork {
    private client: PoolClient | null = null;

    constructor(private pool: Pool) {}

    async run<T>(work: (repos: UnitOfWorkRepositories) => Promise<Result<T, AppError>>): Promise<Result<T, AppError>> {
        this.client = await this.pool.connect();

        try {
            await this.client.query('BEGIN');

            const repos = {
                orderRepository: new PostgresOrderRepository(this.client)
            };

            const result = await work(repos);

            if (result.isFailure) {
                await this.client.query('ROLLBACK');
                return result;
            }

            await this.client.query('COMMIT');
            return result;
        } catch (error: any) {
            await this.client.query('ROLLBACK');
            return err(new InfraError(error?.message || 'Transaction failed'));
        } finally {
            this.client.release();
            this.client = null;
        }
    }
}