# 🚀 Deploy NPI Academic Management System to Vercel

## **Quick Vercel Deployment Guide**

Since you were using Vercel, here's how to deploy your complete academic management system to Vercel:

### **Option 1: Deploy via Vercel CLI (Recommended)**

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Navigate to your project**:
```bash
cd npi
```

3. **Login to Vercel**:
```bash
vercel login
```

4. **Deploy to Vercel**:
```bash
vercel --prod
```

### **Option 2: Deploy via Vercel Dashboard**

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Complete admin system ready for Vercel"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `npi` folder as the root directory

3. **Configure Environment Variables**:
   Add these in your Vercel project settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### **Vercel Configuration**

Your `vercel.json` is now optimized for Next.js:
- ✅ Framework detection enabled
- ✅ Function timeout set to 30 seconds
- ✅ Environment variables configured
- ✅ Build settings optimized

### **Environment Variables Setup**

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add these variables:

| Variable Name | Value | Environment |
|---------------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production |

### **Domain Configuration**

Once deployed, update your Supabase settings:

1. **In Supabase Dashboard**:
   - Go to **Authentication → Settings**
   - Update **Site URL** to your Vercel domain (e.g., `https://your-project.vercel.app`)
   - Add **Redirect URLs**:
     - `https://your-project.vercel.app/login`
     - `https://your-project.vercel.app/dashboard`
     - `https://your-project.vercel.app/admin-dashboard`

### **Build Settings (if needed)**

If you need to customize build settings in Vercel:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### **Custom Domain (Optional)**

To add a custom domain:

1. Go to your Vercel project **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase authentication settings with new domain

## **🎯 What Doesn't Change**

All the backend setup remains exactly the same:

- ✅ **Database Setup**: Same Supabase database and tables
- ✅ **Sample Data**: Same SQL scripts to populate data
- ✅ **Security**: Same RLS policies and authentication
- ✅ **Admin Features**: Same complete admin system
- ✅ **User Management**: Same full CRUD operations

**Only the hosting platform changes from Netlify to Vercel!**

## **🚀 After Deployment**

Once deployed to Vercel:

1. **Test the application** at your Vercel URL
2. **Run the database setup** (same as before):
   - Execute `schema.sql` in Supabase
   - Execute `comprehensive-sample-data.sql` for test data
   - Execute `rls-policies.sql` for security
3. **Update authentication settings** in Supabase with your Vercel URL
4. **Test login** with sample credentials

## **📞 Vercel-Specific Support**

- **Vercel Docs**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables

Your complete academic management system will work exactly the same on Vercel as it does on Netlify! 🎓
