const { sequelize } = require('../src/config/database');

describe('Database Connection', () => {
  // Close the database connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  it('should connect to the database successfully', async () => {
    try {
      await sequelize.authenticate();
      expect(true).toBe(true); // Connection successful
    } catch (error) {
      // This will fail the test if connection fails
      expect(error).toBeUndefined();
    }
  });

  it('should query the database version', async () => {
    try {
      const [results] = await sequelize.query('SELECT version();');
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].version).toBeDefined();
      console.log('PostgreSQL version:', results[0].version);
    } catch (error) {
      // This will fail the test if query fails
      expect(error).toBeUndefined();
    }
  });

  it('should have access to required tables', async () => {
    try {
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableNames = tables.map(t => t.table_name);
      console.log('Available tables:', tableNames);
      
      // Check for essential tables
      expect(tableNames).toContain('users');
      
    } catch (error) {
      // This will fail the test if query fails
      expect(error).toBeUndefined();
    }
  });
}); 