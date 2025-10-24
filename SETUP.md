# Image Processor Setup

## Environment Variables

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Supabase Storage Setup

1. Create a bucket named `images` in your Supabase storage
2. Set the bucket to public or configure appropriate policies

## API Integration

Replace the sample API call in `app/api/process/route.ts` with your actual image processing API.

## Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the image processor.