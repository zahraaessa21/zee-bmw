// ============================================================
// lib/supabase.js — Supabase Database Client
// ============================================================
// Supabase is our BACKEND. It replaces the ASP.NET Core API
// requirement by giving us:
//   - A PostgreSQL database (replaces SQL Server)
//   - A REST API (replaces ASP.NET controllers)
//   - Authentication with JWT (replaces custom JWT system)
//   - Row Level Security (replaces authorization middleware)
//
// This file creates ONE shared Supabase client that we import
// everywhere we need to talk to the database.
//
// HOW TO SET UP YOUR SUPABASE PROJECT:
// 1. Go to https://supabase.com → New Project
// 2. Copy your Project URL and anon key from:
//    Settings → API → Project URL + anon/public key
// 3. Paste them below, replacing the placeholder values
// ============================================================

import { createClient } from '@supabase/supabase-js'

// YOUR SUPABASE PROJECT CREDENTIALS
// Replace these with your actual values from supabase.com/dashboard
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iubquasthfiwpmnzsjng.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YnF1YXN0aGZpd3Btbnpzam5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTExNjUsImV4cCI6MjA5NjE2NzE2NX0.C0veUFpwiFiABJk1dU3-zT4AaLBEVGPb2Ac82XZEGy4'

// ── Create and Export the Client ──────────────────────────── 
// createClient() initializes the connection.
// We export it as a singleton (one instance for whole app).
// The 'auth' option tells Supabase to store the JWT token
// in localStorage so the user stays logged in after refresh.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,          // Keep user logged in after page refresh
    autoRefreshToken: true,        // Automatically refresh the JWT when it expires
    detectSessionInUrl: true,      // Handle OAuth redirect callbacks
  }
})

// ============================================================
// DATABASE SCHEMA — Run this SQL in Supabase SQL Editor
// ============================================================
// 
// -- TABLE 1: profiles (extends Supabase's built-in auth.users)
// -- Purpose: Store extra user info beyond email/password
// CREATE TABLE public.profiles (
//   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   full_name TEXT,
//   phone TEXT,
//   role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
//   avatar_url TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- TABLE 2: cars (the main inventory table)
// -- Purpose: All vehicles available for rent or purchase
// CREATE TABLE public.cars (
//   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//   model TEXT NOT NULL,            -- e.g. "BMW M4 Competition"
//   series TEXT DEFAULT 'M Series', -- e.g. "M Series", "X Series"
//   type TEXT DEFAULT 'Coupe',      -- Body style: Coupe, Sedan, SUV, Convertible
//   year INT NOT NULL,
//   color TEXT,
//   mileage INT DEFAULT 0,
//   horsepower INT,
//   acceleration NUMERIC(3,1),      -- 0-60 mph in seconds
//   top_speed INT,                  -- in mph
//   transmission TEXT DEFAULT '8-SPD',
//   drive_type TEXT DEFAULT 'RWD',
//   engine TEXT,
//   interior TEXT,
//   description TEXT,
//   image_url TEXT,
//   availability TEXT DEFAULT 'rent' CHECK (availability IN ('rent','sale','both')),
//   status TEXT DEFAULT 'available' CHECK (status IN ('available','booked','sold')),
//   sale_price NUMERIC(12,2),
//   rent_price_daily NUMERIC(8,2),
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- TABLE 3: bookings (orders for rent or purchase)
// -- Purpose: Links a user to a car, stores rental dates & price
// CREATE TABLE public.bookings (
//   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
//   car_id BIGINT NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
//   booking_type TEXT NOT NULL CHECK (booking_type IN ('rent','sale')),
//   status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','active','completed','cancelled')),
//   start_date DATE,
//   end_date DATE,
//   insurance_tier TEXT DEFAULT 'standard',
//   pickup_location TEXT,
//   total_price NUMERIC(10,2) NOT NULL,
//   notes TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// -- ROW LEVEL SECURITY (RLS) — This is the authorization layer
// -- It replaces [Authorize] attributes in ASP.NET
// ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
// ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
// ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
//
// -- Anyone can read cars (public catalog)
// CREATE POLICY "cars_public_read" ON public.cars FOR SELECT USING (true);
//
// -- Only admins can insert/update/delete cars
// CREATE POLICY "cars_admin_write" ON public.cars 
//   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
//
// -- Users can only see their own bookings
// CREATE POLICY "bookings_own" ON public.bookings 
//   FOR ALL USING (auth.uid() = user_id);
//
// -- Users can read/update their own profile
// CREATE POLICY "profiles_own" ON public.profiles 
//   FOR ALL USING (auth.uid() = id);
//
// -- AUTO-CREATE PROFILE TRIGGER
// -- When a user registers, automatically create their profile row
// CREATE OR REPLACE FUNCTION public.handle_new_user()
// RETURNS TRIGGER AS $$
// BEGIN
//   INSERT INTO public.profiles (id, full_name, phone)
//   VALUES (
//     new.id,
//     new.raw_user_meta_data->>'full_name',
//     new.raw_user_meta_data->>'phone'
//   );
//   RETURN new;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER on_auth_user_created
//   AFTER INSERT ON auth.users
//   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
//
// -- SAMPLE DATA
// INSERT INTO public.cars (model, series, type, year, color, horsepower, acceleration, top_speed, transmission, drive_type, engine, interior, description, image_url, availability, status, sale_price, rent_price_daily)
// VALUES
// ('BMW M4 Competition', 'M Series', 'Coupe', 2024, 'Isle of Man Green', 503, 3.4, 180, 'M Steptronic 8-Spd', 'RWD', '3.0L BMW M TwinPower Turbo', 'Merino Leather', 'The ultimate expression of the driver''s car.', 'https://...', 'both', 'available', 89500, 450),
// ('BMW M5 CS', 'M Series', 'Sedan', 2023, 'Frozen Black', 627, 2.9, 190, 'M xDrive 8-Spd', 'AWD', '4.4L V8 M TwinPower Turbo', 'Full Merino', 'Track-honed luxury sedan.', 'https://...', 'rent', 'available', NULL, 650),
// ('BMW X5 M Competition', 'X Series', 'SUV', 2024, 'Tanzanite Blue', 617, 3.7, 177, 'M Steptronic 8-Spd', 'AWD', '4.4L V8', 'Vernasca Leather', 'Power meets versatility.', 'https://...', 'both', 'available', 115000, 550);
// ============================================================
