const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('--- 🚢 SEEDING INITIAL MOCK DATA ---');

  const mockClients = [
    { id: 'CLI-001', name: 'John Doe', mobile: '971501234567', email: 'john@example.com', status: 'active', clientType: 'individual', service: 'Visa Services', revenue: 1500, createdAt: new Date().toISOString() },
    { id: 'CLI-002', name: 'Jane Smith', mobile: '971507654321', email: 'jane@example.com', status: 'active', clientType: 'individual', service: 'Gold Visa', revenue: 25000, createdAt: new Date().toISOString() }
  ];

  const mockTasks = [
    { id: 'TSK-001', title: 'Collect Passport', clientName: 'John Doe', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
    { id: 'TSK-002', title: 'File Submission', clientName: 'Jane Smith', status: 'in-progress', dueDate: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date().toISOString() }
  ];

  await supabase.from('clients').upsert(mockClients);
  await supabase.from('tasks').upsert(mockTasks);

  console.log('✅ SEEDING COMPLETE: Your dashboard now has demo data.');
}

seedData();
