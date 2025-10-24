import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const fileName = `${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, fileBuffer, {
        contentType: file.type
      })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)
    
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}