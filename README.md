# 🔖 MarkSync

**Your Beautiful Bookmark Manager**

A modern, real-time bookmark management application built with Next.js 16, Supabase, and TypeScript. Save, organize, and sync your bookmarks instantly across all devices.

![Made with Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.95.3-green?style=flat-square&logo=supabase)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Problems Faced & Solutions](#-problems-faced--solutions)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Author](#-author)

---

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📱 **Real-time Sync** - Bookmarks update instantly across all open tabs
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 📲 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Built with Next.js 16 and Turbopack
- 🗄️ **Supabase Backend** - PostgreSQL database with Row Level Security
- 🔄 **Live Updates** - WebSocket-based real-time synchronization
- 🎯 **Type-Safe** - Full TypeScript support

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS | ^4 |
| **Backend** | Supabase | 2.95.3 |
| **Database** | PostgreSQL | (via Supabase) |
| **Auth** | Supabase Auth | (Google OAuth) |
| **Realtime** | Supabase Realtime | WebSockets |

---

## 🔥 Problems Faced & Solutions

This section documents the key challenges encountered during development and how they were solved.

### 1. **Real-Time Sync Not Working**

#### Problem
After implementing the Supabase real-time listener, bookmarks were not syncing across tabs. The subscription status showed `CLOSED` instead of `SUBSCRIBED`.

#### Root Causes Identified
1. Supabase client was not configured with real-time options
2. Real-time was not enabled on the `bookmarks` table in Supabase dashboard
3. Channel configuration had unnecessary options causing conflicts

#### Solution
```typescript
// ❌ Before: Missing realtime config
const supabase = createClient(url, key);

// ✅ After: Added realtime configuration
const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

**Additional Steps:**
- Enabled real-time in Supabase Dashboard → Database → Replication
- Simplified channel name from `"realtime-bookmarks"` to `"public:bookmarks"`
- Removed unnecessary broadcast/presence config options
- Added comprehensive error logging to diagnose connection issues

**Result:** Real-time sync now works perfectly. Adding a bookmark in one tab instantly appears in all other open tabs.

---

### 2. **React Hydration Error**

#### Problem
Console showed hydration mismatch error:
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties
```

The error pointed to the `<body>` tag with an unexpected `cz-shortcut-listen="true"` attribute.

#### Root Cause
Browser extensions (like Chrome extensions) inject attributes into the DOM after server-side rendering but before React hydration, causing a mismatch.

#### Solution
```tsx
// Added suppressHydrationWarning to body tag
<body
  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  suppressHydrationWarning
>
  {children}
</body>
```

**Why This Works:** The `suppressHydrationWarning` prop tells React to ignore hydration mismatches on this specific element, which is safe since the attributes are added by browser extensions and don't affect functionality.

**Result:** Clean console with no hydration warnings.

---

### 3. **Responsive Design Challenges**

#### Problem
The app looked great on desktop but was unusable on mobile:
- Text was too large and overflowed
- Layout didn't stack properly
- Touch targets were too small
- Spacing was inconsistent across screen sizes

#### Solution: Mobile-First Responsive Design

**Implemented Tailwind Breakpoints:**
```tsx
// ❌ Before: Fixed desktop sizes
<h1 className="text-8xl">MARKSYNC</h1>

// ✅ After: Responsive scaling
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
  MARKSYNC
</h1>
```

---

### 4. **Row Level Security (RLS) Policies**

#### Problem
Users could potentially see or modify other users' bookmarks without proper security policies.

#### Solution
Implemented comprehensive RLS policies:

```sql
-- Users can only view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

**Security Benefits:**
- Database-level security (not just client-side)
- Automatic enforcement by PostgreSQL
- Protection against API manipulation
- Works seamlessly with real-time subscriptions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account ([Sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Soumik-R/marksync.git
cd marksync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **Settings** > **API** to get your credentials
3. Create a `bookmarks` table with the following SQL:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime (CRITICAL for real-time sync)
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

4. **Enable Real-time in Dashboard:**
   - Go to **Database** → **Replication**
   - Find `bookmarks` table
   - Toggle **Enable Realtime** to ON
   - Click **Save**

5. **Enable Google OAuth:**
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add your Google OAuth credentials

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important:** Never commit `.env.local` to version control!

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy! 🚀

**Important Deployment Notes:**
- ✅ Environment variables must use `NEXT_PUBLIC_` prefix for client-side access
- ✅ Configure Supabase redirect URLs in Authentication → URL Configuration
- ✅ Add your Vercel domain to allowed OAuth redirect URLs

---

## 🔒 Security Features

- **Row Level Security (RLS)** - Users can only access their own bookmarks
- **Environment Variables** - Sensitive data kept secure
- **OAuth 2.0** - Secure authentication via Google
- **HTTPS-only** - Encrypted connections in production
- **Database-level Security** - PostgreSQL policies enforce access control

---

## 🐛 Troubleshooting

### Real-time Not Working

**Symptoms:** Bookmarks don't sync across tabs

**Solutions:**
1. Check browser console for subscription status
2. Verify real-time is enabled in Supabase Dashboard → Database → Replication
3. Ensure RLS policies allow SELECT for authenticated users
4. Check that `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;` was run

### OAuth Redirect Error

**Solutions:**
1. Add your domain to Supabase Auth → URL Configuration
2. Ensure redirect URL matches your deployment URL
3. Check Google OAuth settings in Google Cloud Console

### Hydration Errors

**Solution:** Already handled with `suppressHydrationWarning` on body tag

---

## 👨‍💻 Author

**Soumik Roy**

- LinkedIn: [mesoumikr](https://www.linkedin.com/in/mesoumikr/)
- Email: soumikroy7272@gmail.com
- Instagram: [@soumik.roy_](https://www.instagram.com/soumik.roy_)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by Soumik Roy**
