const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  try {
    console.log("🔄 Running database migration...");
    
    // Read the schema file
    const schemaPath = path.join(__dirname, "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Execute the schema
    await pool.query(schema);
    
    console.log("✅ Database migration completed successfully!");
    console.log("\n📝 Default admin user created:");
    console.log("   Email: admin@pms.com");
    console.log("   Password: admin123");
    console.log("\n⚠️  Please change this password in production!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
