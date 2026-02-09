import dataSource from '../data-source';

/**
 * Database Seeder Runner
 *
 * Executes all seeders in order.
 * Run with: npm run seed
 */
async function runSeeders(): Promise<void> {
  try {
    // Initialize data source
    await dataSource.initialize();
    console.log('📦 Data source initialized');

    // Import and run seeders
    // const userSeeder = await import('./user.seeder');
    // await userSeeder.run(dataSource);

    console.log('✅ All seeders executed successfully');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

runSeeders();
