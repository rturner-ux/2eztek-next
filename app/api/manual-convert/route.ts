import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const manualUrl = body.manualUrl
    const brand = body.brand
    const slug = body.slug

    if (!manualUrl || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing manualUrl or slug',
        },
        { status: 400 }
      )
    }

    const pdfResponse = await fetch(manualUrl)

    if (!pdfResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to fetch manual PDF',
          status: pdfResponse.status,
        },
        { status: 400 }
      )
    }

    const arrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    const pdfParseModule = await import('pdf-parse')
    const PDFParse = pdfParseModule.PDFParse

    const parser = new PDFParse({ data: pdfBuffer })
    const parsed = await parser.getText()

    const rawText = parsed.text || ''

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'No readable text found in PDF',
        },
        { status: 422 }
      )
    }

    const cleanedText = rawText
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const stepMatches = cleanedText.match(
      /(step\s+\d+[\s\S]*?)(?=step\s+\d+|$)/gi
    )

    const steps =
      stepMatches && stepMatches.length > 0
        ? stepMatches.map((step, index) => ({
            step_number: index + 1,
            title: extractStepTitle(step, index + 1),
            instructions: step.trim(),
          }))
        : splitIntoFallbackSteps(cleanedText)

    const { data, error } = await supabase
      .from('manual_conversions')
      .insert({
        slug,
        brand: brand || null,
        manual_url: manualUrl,
        raw_text: cleanedText,
        steps,
        status: 'converted',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save converted manual',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Manual converted successfully',
      slug,
      totalSteps: steps.length,
      conversion: data,
    })
  } catch (error) {
    console.error('Manual conversion error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Server error during manual conversion',
      },
      { status: 500 }
    )
  }
}

function extractStepTitle(stepText: string, stepNumber: number) {
  const firstLine = stepText
    .split('\n')
    .find((line) => line.trim().length > 0)

  return firstLine?.trim() || `Step ${stepNumber}`
}

function splitIntoFallbackSteps(text: string) {
  const sections = text
    .split(/\n\s*\n/g)
    .map((section) => section.trim())
    .filter((section) => section.length > 80)

  return sections.slice(0, 40).map((section, index) => ({
    step_number: index + 1,
    title: `Manual Section ${index + 1}`,
    instructions: section,
  }))
}