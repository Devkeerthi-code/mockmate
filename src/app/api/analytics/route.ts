import { NextResponse } from 'next/server'
import { getAggregatedMetrics } from '@/lib/metrics'

export async function GET() {
  try {
    const metrics = await getAggregatedMetrics()
    return NextResponse.json({
      metrics,
      privacyStatement: 'Metrics are purely aggregated platform event counts. Zero student audio, text, or personal identifiable information is tracked or stored in telemetry.',
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
