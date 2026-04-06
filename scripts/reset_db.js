const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MAPPING ERROR: Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function performHardReset() {
  console.log('--- 🛡️ NAWI CRM: HARD RESET INITIALIZED ---');
  console.warn('⚠️ WARNING: This will permanently delete all data except the System Admin.');

  const tables = ['clients', 'tasks', 'goals', 'attendance', 'leave', 'quotations', 'audit_log', 'notifications'];

  for (const table of tables) {
    console.log(`🧼 Truncating table: [${table}]...`);
    const { error } = await supabase.from(table).delete().neq('id', 'TRUNCATE_HACK'); // Supabase requires a filter for delete ops
    if (error) {
      console.warn(`Could not clear [${table}]: ${error.message} (It may already be empty or missing)`);
    } else {
      console.log(`✅ Table [${table}] cleared.`);
    }
  }

  // Handle Employees separately to preserve ADM-001
  console.log('🧼 Cleaning employees list...');
  const { error: empError } = await supabase
    .from('employees')
    .delete()
    .neq('id', 'ADM-001'); // Delete everyone except original Admin
  
  if (empError) {
    console.error(`❌ Error cleaning employees: ${empError.message}`);
  } else {
    console.log('✅ Employee list cleaned (Preserved Administrator).');
  }

  // Ensure Admin exists and has a fresh password
  console.log('🔐 Resetting System Administrator credentials...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const { error: adminError } = await supabase
    .from('employees')
    .upsert([{
      id: 'ADM-001',
      name: 'System Administrator',
      email: 'admin@nawisaadi.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }]);

  if (adminError) {
    console.error(`❌ Error resetting admin: ${adminError.message}`);
  } else {
    console.log('\n🌟 DATABASE REFRESH SUCCESSFUL!');
    console.log('--------------------------------------');
    console.log('Email: admin@nawisaadi.com');
    console.log('Password: Admin123!');
    console.log('--------------------------------------');
  }
}

performHardReset();
