const pool = require('./config/db');

async function checkTables() {
  try {
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%report%'");
    console.log('Report tables:', result.rows.map(r => r.tablename));
    
    if (result.rows.length > 0) {
      const reportsResult = await pool.query('SELECT COUNT(*) FROM reports');
      console.log('Reports count:', reportsResult.rows[0].count);
    }
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkTables();