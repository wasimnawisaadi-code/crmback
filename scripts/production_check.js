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

async function checkProductionReady() {
  console.log('--- 🛠️ PRODUCTION CONNECTIVITY CHECK ---');
  
  // 1. Connection Check
  try {
    const { data: health, error } = await supabase.from('employees').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ SUPABASE CONNECTION: Healthy');
  } catch (err) {
    console.error('❌ SUPABASE CONNECTION: Failed ->', err.message);
  }

  // 2. Table Verification
  const tables = ['employees', 'clients', 'tasks', 'attendance', 'leave', 'goals', 'notifications', 'audit_log'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.warn(`⚠️ TABLE MISSING: '${table}' - Run supabase_schema.sql in your Supabase SQL Editor.`);
    } else {
      console.log(`✅ TABLE VERIFIED: '${table}'`);
    }
  }

  // 3. Admin Existence Check
  const { data: admins } = await supabase.from('employees').select('id, email').eq('role', 'admin');
  if (admins && admins.length > 0) {
    console.log(`✅ ADMIN AUTH: Found ${admins.length} active administrator(s).`);
  } else {
    console.warn('⚠️ NO ADMIN FOUND: Creating default administrator (admin@nawisaadi.com / Admin123!)');
    const pwd = await bcrypt.hash('Admin123!', 10);
    await supabase.from('employees').insert([{
      id: 'ADM-001',
      name: 'System Administrator',
      email: 'admin@nawisaadi.com',
      password: pwd,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }]);
  }

  console.log('--- ✅ CHECK COMPLETE ---');
}

checkProductionReady();
