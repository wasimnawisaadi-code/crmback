-- NAWI TRAVEL CRM - FULL DATABASE SCHEMA INIT
-- Run this script in the Supabase SQL Editor

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  "id" text PRIMARY KEY,
  "name" text,
  "mobile" text,
  "email" text,
  "passportNo" text,
  "clientType" text,
  "companyName" text,
  "companyNumber" text,
  "paymentType" text,
  "service" text,
  "serviceSubcategory" text,
  "leadSource" text,
  "nationality" text,
  "serviceDetails" jsonb DEFAULT '{}'::jsonb,
  "documents" jsonb DEFAULT '[]'::jsonb,
  "importantDates" jsonb DEFAULT '{}'::jsonb,
  "familyMembers" jsonb DEFAULT '[]'::jsonb,
  "serviceHistory" jsonb DEFAULT '[]'::jsonb,
  "status" text,
  "assignedTo" text,
  "revenue" numeric DEFAULT 0,
  "profit" numeric DEFAULT 0,
  "notes" text,
  "history" jsonb DEFAULT '[]'::jsonb,
  "createdAt" text,
  "createdBy" text,
  "updatedAt" text
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  "id" text PRIMARY KEY,
  "clientId" text,
  "clientName" text,
  "service" text,
  "title" text,
  "assignedTo" text,
  "assignedToName" text,
  "dueDate" text,
  "completedDate" text,
  "status" text,
  "profit" numeric DEFAULT 0,
  "notes" text,
  "goalId" text,
  "createdAt" text,
  "createdBy" text
);

-- 3. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  "id" text PRIMARY KEY,
  "title" text,
  "assignedTo" text,
  "startDate" text,
  "endDate" text,
  "description" text,
  "yearMonth" text,
  "status" text,
  "createdBy" text,
  "createdAt" text
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  "id" text PRIMARY KEY,
  "employeeId" text,
  "date" text,
  "loginTime" text,
  "logoutTime" text,
  "hoursWorked" numeric DEFAULT 0,
  "status" text
);

-- 5. Leave Policy / Requests Table
CREATE TABLE IF NOT EXISTS public.leave (
  "id" text PRIMARY KEY,
  "employeeId" text,
  "startDate" text,
  "endDate" text,
  "type" text,
  "reason" text,
  "status" text,
  "repliedBy" text,
  "createdAt" text
);

-- 6. Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
  "id" text PRIMARY KEY,
  "clientId" text,
  "clientName" text,
  "date" text,
  "items" jsonb DEFAULT '[]'::jsonb,
  "subtotal" numeric DEFAULT 0,
  "tax" numeric DEFAULT 0,
  "total" numeric DEFAULT 0,
  "status" text,
  "validUntil" text,
  "createdBy" text,
  "notes" text
);

-- 7. Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  "id" text PRIMARY KEY,
  "action" text,
  "entityType" text,
  "entityId" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "userId" text,
  "userName" text,
  "timestamp" text
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  "id" text PRIMARY KEY,
  "userId" text,
  "type" text,
  "title" text,
  "message" text,
  "isRead" boolean DEFAULT false,
  "link" text,
  "taskId" text,
  "createdAt" text
);

-- Disable Row Level Security (RLS) on all these tables since we secure them at the Node API level
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
