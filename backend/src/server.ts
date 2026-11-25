import app from './app';
import config from './config';
import connectDatabase from './config/database';
import { seedDatabase } from './config/seed';

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  // Connect to MongoDB
  await connectDatabase();
  await seedDatabase();

  // Start listening
  const server = app.listen(config.port, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║         Near By Mart — API Server          ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Environment : ${config.nodeEnv.padEnd(27)}║`);
    console.log(`║  Port        : ${String(config.port).padEnd(27)}║`);
    console.log(`║  Frontend    : ${config.frontendUrl.padEnd(27)}║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
  });

  // ── Graceful shutdown ──
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('🛑 HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    console.error('❌ Unhandled Rejection:', reason);
    // Close server & exit (PM2 or systemd will restart)
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    server.close(() => process.exit(1));
  });
};

startServer();
