const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const SALT_ROUNDS = 10;

async function hashExisting() {
  console.log('Fetching employees...');
  const { data: employees, error } = await supabase.from('employees').select('id, password');
  
  if (error) {
    console.error('Error fetching employees:', error);
    return;
  }

  console.log(`Processing ${employees.length} employees...`);

  for (const emp of employees) {
    // Basic check: if it looks like a bcrypt hash (starts with $2), skip
    if (emp.password && emp.password.startsWith('$2')) {
      console.log(`Skipping ${emp.id} (already hashed)`);
      continue;
    }

    console.log(`Hashing password for ${emp.id}...`);
    const hashedPassword = await bcrypt.hash(emp.password, SALT_ROUNDS);
    
    const { error: updateError } = await supabase
      .from('employees')
      .update({ password: hashedPassword })
      .eq('id', emp.id);

    if (updateError) {
      console.error(`Error updating employee ${emp.id}:`, updateError);
    } else {
      console.log(`Successfully hashed ${emp.id}`);
    }
  }

  console.log('Hashing complete!');
}

hashExisting();
