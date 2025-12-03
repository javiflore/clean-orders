import { Pool } from "pg";

export interface OutboxEvent {
  id: number;
  aggregate_sku: string;
  event_type: string;
  payload: any;
  created_at: Date;
}

export type EventHandler = (event: OutboxEvent) => Promise<void>;

/**
 * Dispatcher que lee eventos no publicados de la tabla outbox
 * usando FOR UPDATE SKIP LOCKED para concurrencia segura.
 */
export class OutboxDispatcher {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly pool: Pool,
    private readonly eventHandler: EventHandler,
    private readonly pollIntervalMs: number = 5000,
    private readonly batchSize: number = 10
  ) {}

  /**
   * Inicia el dispatcher con polling periódico.
   */
  start(): void {
    if (this.isRunning) {
      console.warn("OutboxDispatcher already running");
      return;
    }

    this.isRunning = true;
    console.log(
      `OutboxDispatcher started (polling every ${this.pollIntervalMs}ms)`
    );

    this.intervalId = setInterval(() => {
      this.dispatch().catch((error) => {
        console.error("Error dispatching outbox events:", error);
      });
    }, this.pollIntervalMs);

    // Ejecutar inmediatamente
    this.dispatch().catch((error) => {
      console.error("Error dispatching outbox events:", error);
    });
  }

  /**
   * Detiene el dispatcher.
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log("OutboxDispatcher stopped");
  }

  /**
   * Procesa un lote de eventos no publicados.
   * Usa FOR UPDATE SKIP LOCKED para evitar conflictos de concurrencia.
   */
  async dispatch(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Seleccionar eventos no publicados con lock
      const selectQuery = `
        SELECT id, aggregate_sku, event_type, payload, created_at
        FROM outbox
        WHERE published_at IS NULL
        ORDER BY created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `;

      const result = await client.query<OutboxEvent>(selectQuery, [
        this.batchSize,
      ]);

      if (result.rows.length === 0) {
        await client.query("COMMIT");
        return;
      }

      // Procesar cada evento
      for (const event of result.rows) {
        try {
          await this.eventHandler(event);
        } catch (error) {
          console.error(
            `Failed to handle event ${event.id} (${event.event_type}):`,
            error
          );
          // Continuar con el siguiente evento en lugar de rollback
          // En producción podrías implementar reintentos o DLQ
        }
      }

      // Marcar como publicados
      const eventIds = result.rows.map((e) => e.id);
      const updateQuery = `
        UPDATE outbox
        SET published_at = NOW()
        WHERE id = ANY($1::int[])
      `;

      await client.query(updateQuery, [eventIds]);
      await client.query("COMMIT");

      console.log(
        `Dispatched ${result.rows.length} events: ${eventIds.join(", ")}`
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Procesa todos los eventos pendientes de una vez (útil para testing).
   */
  async dispatchAll(): Promise<number> {
    let totalDispatched = 0;
    let hasMore = true;

    while (hasMore) {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");

        const selectQuery = `
          SELECT id, aggregate_sku, event_type, payload, created_at
          FROM outbox
          WHERE published_at IS NULL
          ORDER BY created_at ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        `;

        const result = await client.query<OutboxEvent>(selectQuery, [
          this.batchSize,
        ]);

        if (result.rows.length === 0) {
          hasMore = false;
          await client.query("COMMIT");
          break;
        }

        for (const event of result.rows) {
          await this.eventHandler(event);
        }

        const eventIds = result.rows.map((e) => e.id);
        const updateQuery = `
          UPDATE outbox
          SET published_at = NOW()
          WHERE id = ANY($1::int[])
        `;

        await client.query(updateQuery, [eventIds]);
        await client.query("COMMIT");

        totalDispatched += result.rows.length;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return totalDispatched;
  }
}
