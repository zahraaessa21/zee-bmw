# 🚗 ULTRADRIVE — BMW Luxury Car Shop & Rental App

A full-stack web application built with **React** (frontend) and **Supabase** (backend).  
Designed as a luxury dark-mode BMW rental & purchase platform.

---

## 📁 PROJECT STRUCTURE

```
ultradrive/
├── index.html                  ← HTML entry point (one div: <div id="root">)
├── vite.config.js              ← Build tool configuration
├── package.json                ← Dependencies list
├── .env                        ← Secret credentials (never commit to Git!)
└── src/
    ├── main.jsx                ← Mounts React into index.html
    ├── App.jsx                 ← Router + ProtectedRoute
    ├── index.css               ← Global styles + design system variables
    ├── lib/
    │   └── supabase.js         ← Database client + full SQL schema
    ├── context/
    │   └── AuthContext.jsx     ← Global auth state (JWT + user)
    ├── components/
    │   └── Navbar.jsx          ← Fixed top navigation
    └── pages/
        ├── HomePage.jsx        ← Landing page with hero + fleet scroller
        ├── FleetPage.jsx       ← Car catalog with filters
        ├── CarDetailPage.jsx   ← Individual car + sticky booking card
        ├── BookingPage.jsx     ← 3-step booking wizard
        ├── LoginPage.jsx       ← JWT authentication form
        ├── RegisterPage.jsx    ← Registration with validation
        ├── MyBookings.jsx      ← User's booking history
        ├── AdminPage.jsx       ← Full CRUD admin dashboard
        └── NotFoundPage.jsx    ← 404 catch-all
```

---

## ⚙️ SETUP INSTRUCTIONS

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Create Supabase Project
1. Go to https://supabase.com → Sign up free
2. Click **"New Project"** → name it "ultradrive"
3. Go to **Settings → API** and copy:
   - **Project URL** (looks like: `https://abcdef.supabase.co`)
   - **anon / public** key (long string)

### Step 3 — Run the Database Schema
1. In Supabase dashboard → click **SQL Editor**
2. Paste and run this SQL:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cars table
CREATE TABLE public.cars (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model TEXT NOT NULL,
  series TEXT DEFAULT 'M Series',
  type TEXT DEFAULT 'Coupe',
  year INT NOT NULL,
  color TEXT,
  horsepower INT,
  acceleration NUMERIC(3,1),
  top_speed INT,
  transmission TEXT,
  drive_type TEXT,
  engine TEXT,
  interior TEXT,
  description TEXT,
  image_url TEXT,
  availability TEXT DEFAULT 'rent' CHECK (availability IN ('rent','sale','both')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','booked','sold')),
  sale_price NUMERIC(12,2),
  rent_price_daily NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id BIGINT NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('rent','sale')),
  status TEXT DEFAULT 'confirmed',
  start_date DATE,
  end_date DATE,
  insurance_tier TEXT DEFAULT 'standard',
  pickup_location TEXT,
  total_price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "cars_public_read" ON public.cars FOR SELECT USING (true);
CREATE POLICY "bookings_own" ON public.bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Auto-create profile when user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sample cars
INSERT INTO public.cars (model, series, type, year, color, horsepower, acceleration, top_speed, transmission, drive_type, engine, interior, description, image_url, availability, status, rent_price_daily, sale_price)
VALUES
('BMW M4 Competition', 'M Series', 'Coupe', 2024, 'Isle of Man Green', 503, 3.4, 180, 'M Steptronic 8-Spd', 'RWD', '3.0L BMW M TwinPower Turbo', 'Merino Leather', 'The ultimate expression of the driver''s car.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', 'both', 'available', 450, 89500),
('BMW M5 CS', 'M Series', 'Sedan', 2023, 'Frozen Black', 627, 2.9, 190, 'M xDrive 8-Spd', 'AWD', '4.4L V8 M TwinPower Turbo', 'Full Merino', 'Track-honed luxury sedan.', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80', 'rent', 'available', 650, NULL),
('BMW X5 M Competition', 'X Series', 'SUV', 2024, 'Tanzanite Blue', 617, 3.7, 177, 'M Steptronic 8-Spd', 'AWD', '4.4L V8', 'Vernasca Leather', 'Power meets versatility.', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', 'both', 'available', 550, 115000),
('BMW M8 Gran Coupe', 'M Series', 'Coupe', 2024, 'Carbon Black', 617, 3.0, 190, 'M xDrive 8-Spd', 'AWD', '4.4L V8', 'Merino Leather', 'The pinnacle of performance and luxury.', 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80', 'rent', 'available', 750, NULL);
```

### Step 4 — Configure environment
Edit `.env` file:
```
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### Step 5 — Install & Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

### Step 6 — Create Admin Account
1. Register a normal account through the app
2. In Supabase → Table Editor → profiles table
3. Find your row and change `role` from `"user"` to `"admin"`
4. You'll now see the "ADMIN" link in the navbar

---

## 🗄️ DATABASE DESIGN (3 Related Tables)

```
auth.users (Supabase built-in)
    │
    ├──── profiles (1-to-1)
    │         id → auth.users.id
    │         full_name, phone, role
    │
    └──── bookings (1-to-many)
              user_id → auth.users.id
              car_id  → cars.id
              booking_type, dates, total_price, status

cars (standalone)
    │
    └──── bookings (1-to-many)
              car_id → cars.id
```

**Relationships:**
- One `user` has one `profile` (1:1)
- One `user` can have many `bookings` (1:N)
- One `car` can be in many `bookings` (1:N)

---

## 🔐 AUTHENTICATION FLOW (JWT)

```
1. User fills Login form
2. React calls supabase.auth.signInWithPassword({ email, password })
3. Supabase validates against auth.users table
4. Supabase returns a JWT token (JSON Web Token)
5. Supabase SDK stores JWT in localStorage automatically
6. All future API calls include JWT in "Authorization: Bearer <token>" header
7. Supabase RLS (Row Level Security) reads auth.uid() from the JWT
8. Database only returns rows the user is allowed to see
9. onAuthStateChange listener in AuthContext keeps React state in sync
```

**JWT Structure** (base64 encoded, 3 parts separated by dots):
```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.abc123
```

---

## ⚛️ REACT CONCEPTS USED

| Hook/Concept | Where Used | What It Does |
|---|---|---|
| `useState` | Every page | Stores local component state (form values, loading, active tab) |
| `useEffect` | Every page | Runs code after render (fetch data on page load) |
| `useMemo` | FleetPage | Caches filtered car list — only recomputes when filters change |
| `useContext` | All pages via `useAuth()` | Reads global auth state without prop drilling |
| `useParams` | CarDetailPage | Reads `:id` from URL `/cars/42` → `{ id: "42" }` |
| `useSearchParams` | BookingPage | Reads `?type=rent&start=2025-01-15` query string |
| `useNavigate` | Multiple pages | Programmatic navigation: `navigate('/fleet')` |
| `useLocation` | Navbar | Gets current URL path to highlight active nav link |
| React Context | AuthContext | Global state shared by all components |
| Protected Routes | App.jsx | Redirects unauthenticated users to /login |

---

## 📊 CRUD OPERATIONS

| Operation | HTTP Equivalent | Code | Location |
|---|---|---|---|
| **CREATE** | POST | `supabase.from('cars').insert({...})` | AdminPage — Add car |
| **CREATE** | POST | `supabase.from('bookings').insert({...})` | BookingPage — Confirm booking |
| **READ** | GET | `supabase.from('cars').select('*')` | FleetPage, HomePage |
| **READ** | GET | `supabase.from('bookings').select('*, cars(*)')` | MyBookings (JOIN) |
| **UPDATE** | PATCH | `supabase.from('cars').update({...}).eq('id', id)` | AdminPage — Edit car |
| **UPDATE** | PATCH | `supabase.from('bookings').update({status:'cancelled'})` | MyBookings — Cancel |
| **DELETE** | DELETE | `supabase.from('cars').delete().eq('id', id)` | AdminPage — Delete car |

---

## 🛡️ ROW LEVEL SECURITY (replaces [Authorize] in ASP.NET)

```sql
-- Users can ONLY read their own bookings (even if they guess another user's ID)
CREATE POLICY "bookings_own" ON bookings
  FOR ALL USING (auth.uid() = user_id);

-- This means: SELECT * FROM bookings WHERE user_id = <current_jwt_user_id>
-- The database enforces this, not just the frontend
```

---

## 💡 ANSWERS TO COMMON PROFESSOR QUESTIONS

**Q: Why React instead of plain HTML/JS?**
A: React uses a Virtual DOM — it only updates the parts of the page that changed, instead of reloading the whole page. This makes the app fast and feel like a native mobile app.

**Q: What is a component?**
A: A function that returns JSX (HTML-like syntax). React breaks the UI into reusable pieces. For example, `<CarCard />` is used in both the home page scroller and the fleet grid.

**Q: What is JSX?**
A: JavaScript XML — HTML written inside JavaScript. Babel (a compiler) converts it to `React.createElement()` calls. It lets you write `<button onClick={handleClick}>` instead of `document.createElement('button')`.

**Q: How is data passed between components?**
A: Two ways: (1) **Props** — parent passes data down to child as attributes: `<CarCard car={carData} />`. (2) **Context** — global data accessible by any component without passing through every level.

**Q: What is the difference between state and props?**
A: **Props** are read-only data passed FROM parent TO child. **State** is data that belongs to a component and can change (triggers a re-render when it does).

**Q: How does routing work? There's no server for these routes.**
A: React Router uses the HTML5 History API (`window.history.pushState`) to change the URL without requesting a new page from the server. The server always serves the same `index.html`, and React Router reads the URL and renders the matching component.

**Q: What is Supabase and why use it instead of ASP.NET?**
A: Supabase is a Backend-as-a-Service (BaaS) built on PostgreSQL. It provides a REST API, authentication, and realtime features automatically — no need to write controllers, models, or middleware manually. This lets us focus on the frontend while still having a real database.

**Q: What is Row Level Security?**
A: A PostgreSQL feature that enforces access rules at the database level. Even if someone bypasses the frontend, the database will still only return data they're authorized to see. It replaces `[Authorize]` attributes in ASP.NET.

**Q: How is the JWT stored and sent?**
A: Supabase stores it in `localStorage` automatically. The Supabase client library reads it and adds `Authorization: Bearer <token>` to every API request header.

**Q: What is `useEffect` and why is the dependency array important?**
A: `useEffect` runs side effects after rendering. The dependency array `[id]` means "re-run this effect whenever `id` changes." An empty array `[]` means "run once on mount, like `componentDidMount`." No array means "run after every render."

**Q: What is `useMemo` and when should you use it?**
A: `useMemo` caches the result of an expensive calculation and only recalculates when dependencies change. In FleetPage, filtering 100 cars on every keystroke would be wasteful — `useMemo` ensures it only re-filters when the filter values actually change.

**Q: What is the difference between controlled and uncontrolled inputs?**
A: **Controlled:** React state drives the input value (`value={email}` + `onChange`). React is the "source of truth." **Uncontrolled:** The DOM manages the value, accessed via `useRef`. We use controlled inputs throughout for easy validation and state management.

**Q: How do protected routes work?**
A: The `<ProtectedRoute>` component wraps any page that requires login. Before rendering the page, it checks `useAuth()` for a logged-in user. If none, it calls `<Navigate to="/login" />` which redirects. This is the frontend equivalent of `[Authorize]` in ASP.NET.
