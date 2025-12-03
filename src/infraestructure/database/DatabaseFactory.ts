import { Pool } from 'pg';
import { PgUnitOfWork } from '../persistence/postgres/PgUnitOfWork.js';

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

export class DatabaseFactory {
    private static pool: Pool | null = null;

    /**
     * Crea y retorna un Pool de PostgreSQL singleton.
     */
    static createPool(config: DatabaseConfig): Pool {
        if (!this.pool) {
            this.pool = new Pool({
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                max: config.max ?? 20,
                idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
                connectionTimeoutMillis: config.connectionTimeoutMillis ?? 2000,
            });

            this.pool.on('error', (err) => {
                console.error('Unexpected error on idle PostgreSQL client', err);
            });
        }

        return this.pool;
    }

    /**
     * Crea Pool desde variables de entorno.
     */
    static createPoolFromEnv(): Pool {
        const config: DatabaseConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME || 'clean_orders',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        };

        return this.createPool(config);
    }

    /**
     * Obtiene el Pool singleton (lo crea si no existe).
     */
    static getPool(): Pool {
        if (!this.pool) {
            return this.createPoolFromEnv();
        }
        return this.pool;
    }

    /**
     * Crea una instancia de PgUnitOfWork con el pool configurado.
     */
    static createUnitOfWork(pool?: Pool): PgUnitOfWork {
        const activePool = pool || this.getPool();
        return new PgUnitOfWork(activePool);
    }

    /**
     * Cierra el pool de conexiones.
     */
    static async closePool(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}