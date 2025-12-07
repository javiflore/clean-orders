import { buildContainer, cleanupContainer } from "./composition/container.js";
import { buildServer } from "./infraestructure/http/server.js";
import { FastifyInstance } from "fastify";
import { Dependencies } from "./composition/container.js";

let server: FastifyInstance | null = null;
let dependencies: Dependencies | null = null;

async function main() {
    try{
        dependencies = buildContainer();
        server = await buildServer(dependencies);

        const host = process.env.HOST || '0.0.0.0';
        const port = parseInt(process.env.PORT || '3000', 10);

        await server.listen({ host, port });

        console.log(`🚀 Server listening at http://${host}:${port}`);
        console.log(`💚 Health check at http://${host}:${port}/health`);

    } catch (error) {
        console.error('❌ Error starting server:', error);
        await shutdown(1);
    }   
}

async function shutdown(exitCode: number = 0): Promise<void> {
    console.log('\n🛑 Shutting down gracefully...');
    
    try {
        // Close server first to stop accepting new requests
        if (server) {
            await server.close();
            console.log('✅ Server closed');
        }
        
        // Cleanup resources (database, dispatchers, etc.)
        if (dependencies) {
            await cleanupContainer(dependencies);
        }
        
        console.log('👋 Goodbye!');
        process.exit(exitCode);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Handle termination signals
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    shutdown(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    shutdown(1);
});

main().catch((error) => {
    console.error('💥 Fatal error during startup:', error);
    shutdown(1);
});