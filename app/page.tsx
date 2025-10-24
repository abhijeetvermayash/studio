'use client'

import { useState, useEffect } from 'react'
import { Upload, Sparkles, Download, ArrowRight, Check, Zap } from 'lucide-react'

export default function Home() {
  const [image1, setImage1] = useState<File | null>(null)
  const [image2, setImage2] = useState<File | null>(null)
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedAngles, setSelectedAngles] = useState<string[]>([])

  // Calculate current step based on actual state
  const getCurrentStep = () => {
    if (loading || resultImage) return 4
    if ((image1 || url1) && (image2 || url2) && selectedAngles.length > 0) return 4
    if ((image1 || url1) && (image2 || url2)) return 3
    if (image1 || url1) return 2
    return 1
  }

  const step = getCurrentStep()
  const isStep1Complete = !!(image1 || url1)
  const isStep2Complete = !!(image2 || url2)
  const isStep3Complete = selectedAngles.length > 0

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev
          return Math.min(prev + Math.random() * 15, 95)
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [loading])

  const uploadToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const { url } = await response.json()
    return url
  }

  const handleFileChange = (file: File | null, setFile: (file: File | null) => void, setPreview: (url: string | null) => void) => {
    setFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleUrlChange = (value: string, setUrl: (url: string) => void, setPreview: (url: string | null) => void) => {
    setUrl(value)
    if (value && value.startsWith('http')) {
      setPreview(value)
    } else {
      setPreview(null)
    }
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      console.log('Downloading:', imageUrl)
      
      // Try direct download first
      const a = document.createElement('a')
      a.href = imageUrl
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Fallback: fetch and create blob
      setTimeout(async () => {
        try {
          const response = await fetch(imageUrl, { mode: 'cors' })
          if (!response.ok) throw new Error('Network response was not ok')
          
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const fallbackA = document.createElement('a')
          fallbackA.href = url
          fallbackA.download = filename
          document.body.appendChild(fallbackA)
          fallbackA.click()
          document.body.removeChild(fallbackA)
          URL.revokeObjectURL(url)
        } catch (fetchError) {
          console.error('Fallback download failed:', fetchError)
          // Last resort: open in new tab
          window.open(imageUrl, '_blank')
        }
      }, 100)
    } catch (error) {
      console.error('Download failed:', error)
      // Open in new tab as last resort
      window.open(imageUrl, '_blank')
    }
  }

  const processImages = async () => {
    setLoading(true)
    setProgress(0)
    
    try {
      let imageUrl1 = url1
      let imageUrl2 = url2

      if (image1) imageUrl1 = await uploadToSupabase(image1)
      if (image2) imageUrl2 = await uploadToSupabase(image2)

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: imageUrl1, image2: imageUrl2, angles: selectedAngles })
      })

      const result = await response.json()
      setResultImage(result.images || result.image)
      setProgress(100)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      
      {/* Header */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-medium mb-8 border border-slate-200">
              <Sparkles className="w-3 h-3" />
              STUD.IO
            </div>
            <h1 className="text-6xl font-light text-slate-900 mb-6 tracking-tight">
              <span className="font-extralight">Professional</span>
              <br />
              <span className="font-medium">AI Fashion Studio</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Transform portraits into professional fashion photography with sophisticated AI technology.
            </p>
            <div className="flex justify-center gap-8 text-sm text-slate-500">
              <div>⚡ 30-second generation</div>
              <div>🎯 Studio-quality results</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-20">
          <div className="flex items-center space-x-12">
              {[
                { num: 1, label: 'Product' },
                { num: 2, label: 'Model' },
                { num: 3, label: 'Angles' },
                { num: 4, label: 'Generate' }
              ].map(({ num, label }) => (
                <div key={num} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step >= num 
                        ? 'bg-slate-900 text-white' 
                        : step === num 
                        ? 'bg-slate-200 text-slate-900 ring-2 ring-slate-900' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step > num ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        num
                      )}
                    </div>
                    
                    <div className={`text-xs mt-3 font-medium transition-all duration-300 ${
                      step >= num ? 'text-slate-900' : step === num ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {label}
                    </div>
                  </div>
                  
                  {num < 4 && (
                    <div className="mx-6">
                      <div className={`h-px w-16 transition-all duration-300 ${
                        step > num ? 'bg-slate-900' : 'bg-slate-200'
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Product Upload */}
          <div className={`transition-all duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`bg-white rounded-lg border transition-all duration-300 ${
              step === 1 ? 'border-slate-300 shadow-sm' : 'border-slate-200'
            }`}>
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Product Image</h3>
                    <p className="text-sm text-slate-600 mt-1">Upload the item to showcase</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isStep1Complete ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isStep1Complete ? <Check className="w-3 h-3" /> : '1'}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, setImage1, setPreview1)}
                    className="hidden"
                    id="product-upload"
                  />
                  <label
                    htmlFor="product-upload"
                    className={`block w-full h-48 border border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      step === 1 
                        ? 'border-slate-400 bg-slate-50' 
                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    {preview1 ? (
                      <img src={preview1} alt="Product" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className={`w-8 h-8 mb-3 ${
                          step === 1 ? 'text-slate-600' : 'text-slate-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          step === 1 ? 'text-slate-700' : 'text-slate-500'
                        }`}>
                          Upload product image
                        </span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Model Upload */}
          <div className={`transition-all duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-60'} ${
            !isStep1Complete ? 'pointer-events-none' : ''
          }`}>
            <div className={`bg-white rounded-lg border transition-all duration-300 ${
              step === 2 ? 'border-slate-300 shadow-sm' : 'border-slate-200'
            }`}>
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Model Image</h3>
                    <p className="text-sm text-slate-600 mt-1">Upload the person's portrait</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isStep2Complete ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isStep2Complete ? <Check className="w-3 h-3" /> : '2'}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, setImage2, setPreview2)}
                    className="hidden"
                    id="model-upload"
                    disabled={!isStep1Complete}
                  />
                  <label
                    htmlFor="model-upload"
                    className={`block w-full h-48 border border-dashed rounded-lg transition-all duration-200 ${
                      !isStep1Complete 
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                        : step === 2 
                        ? 'border-slate-400 bg-slate-50 cursor-pointer' 
                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-[1.02] hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    {preview2 ? (
                      <img src={preview2} alt="Model" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className={`w-8 h-8 mb-3 ${
                          !isStep1Complete 
                            ? 'text-slate-300' 
                            : step === 2 
                            ? 'text-slate-600' 
                            : 'text-slate-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          !isStep1Complete 
                            ? 'text-slate-400' 
                            : step === 2 
                            ? 'text-slate-700' 
                            : 'text-slate-500'
                        }`}>
                          Upload model image
                        </span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Angle Selection */}
        <div className={`transition-all duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-60'} mb-16 ${
          !isStep2Complete ? 'pointer-events-none' : ''
        }`}>
          <div className={`bg-white rounded-lg border max-w-4xl mx-auto transition-all duration-300 ${
            step === 3 ? 'border-slate-300 shadow-sm' : 'border-slate-200'
          }`}>
            <div className="p-6 border-b border-slate-100">
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select Angles</h3>
                <p className="text-sm text-slate-600">Choose the poses for your fashion shoot</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'front', label: 'Front View', desc: 'Facing forward' },
                  { id: 'left', label: 'Left Profile', desc: 'Side angle' },
                  { id: 'right', label: 'Right Profile', desc: 'Side angle' },
                  { id: 'three-quarter', label: '3/4 View', desc: 'Angled pose' },
                  { id: 'back', label: 'Back View', desc: 'Rear view' },
                  { id: 'top', label: 'High Angle', desc: 'From above' }
                ].map(({ id, label, desc }) => (
                  <label key={id} className={`relative cursor-pointer ${
                    !isStep2Complete ? 'cursor-not-allowed' : ''
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedAngles.includes(id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAngles(prev => [...prev, id])
                        } else {
                          setSelectedAngles(prev => prev.filter(angle => angle !== id))
                        }
                      }}
                      disabled={!isStep2Complete}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                      selectedAngles.includes(id)
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    } ${!isStep2Complete ? 'opacity-50' : ''}`}>
                      <div className="text-center">
                        <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs ${
                          selectedAngles.includes(id)
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedAngles.includes(id) ? '✓' : '○'}
                        </div>
                        <div className="text-sm font-medium text-slate-900">{label}</div>
                        <div className="text-xs text-slate-500 mt-1">{desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-16 relative z-50">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Button clicked!')
              processImages()
            }}
            style={{ pointerEvents: 'auto' }}
            className="px-8 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 hover:scale-105 hover:shadow-lg cursor-pointer transition-all duration-200 relative z-50"
          >
            <div className="flex items-center gap-3" style={{ pointerEvents: 'none' }}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Generate Images</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="max-w-lg mx-auto mb-16">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-slate-900 mb-1">Processing Images</h3>
                <p className="text-sm text-slate-600">Generating your professional fashion photography</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center text-xs text-slate-500">{Math.min(Math.round(progress), 100)}% complete</div>
            </div>
          </div>
        )}

        {/* Result */}
        {resultImage && (
          <div>
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Generated Images</h3>
                  <p className="text-sm text-slate-600">Professional fashion photography results</p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="max-w-5xl mx-auto">
                  {Array.isArray(resultImage) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resultImage.map((img, index) => {
                        const imageUrl = typeof img === 'string' ? img : img.url || img
                        const filename = `stud-io-${selectedAngles[index] || index + 1}.jpg`
                        
                        return (
                          <div key={index} className="flex flex-col">
                            <div className="relative mb-4">
                              <img 
                                src={imageUrl} 
                                alt={`Generated model ${index + 1}`} 
                                className="w-full rounded-lg border border-slate-200 hover:shadow-lg transition-all duration-300"
                              />
                            </div>
                            <div className="text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  downloadImage(imageUrl, filename)
                                }}
                                style={{ pointerEvents: 'auto' }}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 hover:scale-105 transition-all duration-200 relative z-10"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto">
                      <div className="relative">
                        <img 
                          src={resultImage} 
                          alt="Generated model" 
                          className="w-full rounded-lg border border-slate-200 hover:shadow-lg transition-all duration-300"
                        />
                      </div>
                      
                      <div className="text-center mt-6">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            downloadImage(resultImage, 'stud-io-model.jpg')
                          }}
                          style={{ pointerEvents: 'auto' }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 hover:scale-105 transition-all duration-200 relative z-10"
                        >
                          <Download className="w-4 h-4" />
                          Download Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Promotion */}
        <div className="mt-24 border-t border-slate-200 pt-16 pb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">STUD.IO</span>
            </div>
            <h2 className="text-2xl font-light text-slate-900 mb-4">
              The Future of Fashion Photography
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8">
              Join thousands of brands and creators using STUD.IO to transform ordinary photos into professional fashion campaigns. No studio, no photographer, no problem.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-900" />
                <span>Professional Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-900" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-900" />
                <span>Multiple Angles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-900" />
                <span>Commercial License</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-slate-400">
            <p>© 2024 STUD.IO - Revolutionizing Fashion Photography with AI</p>
          </div>
        </div>
      </div>

    </div>
  )
}