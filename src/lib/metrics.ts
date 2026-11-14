import { prisma } from './prisma'

export async function recordMetric(metricName: string, delta = 1) {
  try {
    const today = new Date().toISOString().split('T')[0]
    await prisma.usageMetric.upsert({
      where: {
        date_metricName: {
          date: today,
          metricName,
        },
      },
      update: {
        count: {
          increment: delta,
        },
      },
      create: {
        date: today,
        metricName,
        count: delta,
      },
    })
  } catch (error) {
    // Fail silently so metric logging never interrupts an interview
    console.error('Failed to log metric:', metricName, error)
  }
}

export async function getAggregatedMetrics() {
  try {
    const metrics = await prisma.usageMetric.groupBy({
      by: ['metricName'],
      _sum: {
        count: true,
      },
    })

    const summary: Record<string, number> = {}
    for (const item of metrics) {
      summary[item.metricName] = item._sum.count || 0
    }

    return summary
  } catch (error) {
    console.error('Failed to get metrics summary:', error)
    return {}
  }
}
