const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'nawi_saadi_secret_2025';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Supabase Init
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth Logic (Moving logic from frontend to backend for security)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

    if (error || !user) {
        return res.status(401).json({ error: 'Account not found or inactive' });
    }

    // Secure comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== user.password) { // Fallback for transition period if not yet hashed
        if (password !== user.password) return res.status(401).json({ error: 'Invalid password' });
    }

    // Don't send back the password
    delete user.password;

    // Create a real JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
        user,
        session: {
            userId: user.id,
            userName: user.name,
            role: user.role,
            loginTime: new Date().toISOString(),
            token,
        }
    });
});

// Basic Auth Middleware (Can be expanded with JWT)
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    
    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Routes
// Routes
app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.1.0-production'
}));

// Generic GET for all tables (replaces direct Supabase fetches in frontend)
app.get('/api/:table', authenticateUser, async (req, res) => {
    const { table } = req.params;
    
    // For employees, we exclude the password field
    const selectQuery = table === 'employees' 
        ? 'id, name, email, role, status, photo, mobile, "profileType", "emiratesId", "passportNo", "baseSalary", "leaveBalance", "createdAt", "createdBy"'
        : '*';

    const { data, error } = await supabase.from(table).select(selectQuery);
    if (error) return res.status(500).json(error);
    res.json(data);
});

// Generic CRUD
app.post('/api/:table', authenticateUser, async (req, res) => {
    const { table } = req.params;
    let items = Array.isArray(req.body) ? req.body : [req.body];

    // Password Hashing Interceptor for Employees
    if (table === 'employees') {
        items = await Promise.all(items.map(async (emp) => {
            if (emp.password) {
                emp.password = await bcrypt.hash(emp.password, SALT_ROUNDS);
            }
            return emp;
        }));
    }

    const { data, error } = await supabase.from(table).upsert(items).select();
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.put('/api/:table/:id', authenticateUser, async (req, res) => {
    const { table, id } = req.params;
    let changes = { ...req.body };

    // Update Hashing Interceptor
    if (table === 'employees' && changes.password) {
        changes.password = await bcrypt.hash(changes.password, SALT_ROUNDS);
    }

    const { data, error } = await supabase.from(table).update(changes).eq('id', id).select();
    if (error) return res.status(500).json(error);
    res.json(data[0]);
});

app.delete('/api/:table/:id', authenticateUser, async (req, res) => {
    const { table, id } = req.params;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return res.status(500).json(error);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
