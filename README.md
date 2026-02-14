# 🔖 MarkSync

**Your Beautiful Bookmark Manager**

MarkSync is a modern, real time bookmark management application that helps you organize and sync your favorite links across devices. Built with cutting edge technologies.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📱 **Real-time Sync** - Bookmarks update instantly across all devices
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 📲 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Lightning Fast** - Built with Next.js 16 and Turbopack
- 🗄️ **Supabase Backend** - Reliable cloud database and authentication
- 🔄 **Live Updates** - Real-time data synchronization using Supabase Realtime
- 🎯 **TypeScript** - Type-safe development experience

## 🛠️ Tech Stack

### Frontend Frameworks & Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework with App Router |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Utility-first CSS framework |

### Backend & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| [Supabase](https://supabase.com/) | 2.95.3 | Backend-as-a-Service (PostgreSQL, Auth, Realtime) |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction) | 2.95.3 | Supabase JavaScript client |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| [ESLint](https://eslint.org/) | ^9 | Code linting |
| [PostCSS](https://postcss.org/) | - | CSS processing |
| [Turbopack](https://turbo.build/pack) | Built-in | Fast bundler for Next.js |


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account ([Sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd marksync
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **Settings** > **API** to get your credentials
3. Create a `bookmarks` table with the following SQL:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create policy for users to read their own bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Create policy for users to insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy for users to delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

4. Enable Google OAuth:
   - Go to **Authentication** > **Providers**
   - Enable **Google**
   - Add your Google OAuth credentials

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important**: Never commit `.env.local` to version control!

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

## 🔄 Development Workflow

### 1. **Local Development**
```bash
# Start development server
npm run dev

# Make changes to code
# The browser will auto-reload on save
```

### 2. **Testing Build**
```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

### 3. **Code Quality**
```bash
# Check for linting issues
npm run lint
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy! 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/marksync)

### Important Deployment Notes

- ✅ Environment variables must use `NEXT_PUBLIC_` prefix for client-side access
- ✅ Configure Supabase redirect URLs in Authentication > URL Configuration
- ✅ Add your Vercel domain to allowed OAuth redirect URLs

## 🎯 Key Features Explained

### Real-time Synchronization

MarkSync uses Supabase Realtime to instantly sync bookmarks across all connected clients.

### Authentication Flow

- Google OAuth integration via Supabase Auth
- Session management with automatic token refresh
- Secure Row Level Security (RLS) policies

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Adaptive layout: stacks vertically on mobile, side-by-side on desktop
- Touch-friendly UI elements

### Performance Optimizations

- Lazy initialization of Supabase client
- Optimized state management with React hooks
- Turbopack for ultra-fast development builds

## 🔒 Security

- Row Level Security (RLS) ensures users can only access their own bookmarks
- Environment variables keep sensitive data secure
- OAuth 2.0 authentication via Google
- HTTPS-only connections in production

## 🐛 Troubleshooting

### Build Error: "supabaseUrl is required"

Make sure your environment variables are properly set:
1. Check `.env.local` file exists with correct values
2. Restart development server after adding variables
3. For Vercel: Add variables in project settings

### Bookmarks Not Loading

1. Check browser console for errors
2. Verify Supabase RLS policies are set correctly
3. Ensure you're authenticated
4. Check network tab for failed API calls

### OAuth Redirect Error

1. Add your domain to Supabase Auth > URL Configuration
2. Ensure redirect URL matches your deployment URL
3. Check Google OAuth settings

## 👨‍💻 Author

Created with ❤️ by Soumik

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with Next.js 16 + Supabase + TypeScript + Tailwind CSS**
