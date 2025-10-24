import { NextRequest, NextResponse } from 'next/server'
import { fal } from "@fal-ai/client"

fal.config({
  credentials: process.env.FAL_API_KEY
})

const anglePrompts = {
  front: "front view, model facing camera directly",
  left: "left profile view, model facing left side",
  right: "right profile view, model facing right side",
  'three-quarter': "three-quarter view, model at 45-degree angle",
  back: "back view, model facing away from camera",
  top: "high angle shot, camera positioned above model"
}

export async function POST(request: NextRequest) {
  try {
    const { image1, image2, angles } = await request.json()
    
    const results = await Promise.all(
      angles.map(async (angle: string) => {
        const anglePrompt = anglePrompts[angle as keyof typeof anglePrompts] || "front view"
        
        const result = await fal.subscribe("fal-ai/nano-banana/edit", {
          input: {
            prompt: `Create a professional fashion modeling photo where the person is wearing or using the product. Transform the person into a stylish model showcasing the item in a commercial, high-quality fashion photography style. Shot composition: ${anglePrompt}.`,
            image_urls: [image1, image2]
          }
        })

        const imageUrl = result.data?.images?.[0]?.url

        if (!imageUrl) {
          throw new Error(`No image URL found for ${angle} angle`)
        }

        return imageUrl
      })
    )

    return NextResponse.json({ 
      images: results.length > 1 ? results : results[0],
      angles: angles
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}