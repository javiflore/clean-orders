import { buildContainer } from "./composition/container.js";
import { buildServer } from "./infraestructure/http/server.js";

async function main() {
    try{
        const dependencies = buildContainer();
        const server =  await buildServer(dependencies);

        const host = process.env.HOST || '0.0.0.0';
        const port = parseInt(process.env.PORT || '3000', 10);

        await server.listen({ host, port });

        console.log(`Server listening at http://${host}:${port}`);
        console.log(`Health check at http://${host}:${port}/health`);

    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }   
}

process.on('SIGINT', () => {
    console.error('server is shutting down...');
    process.exit(0);
});

main().catch((error) => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});