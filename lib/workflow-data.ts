export interface WorkflowRecord {
  'PB C-ASIN'?: string
  '1P C-ASIN'?: string
  positioning?: string
  'FLC Check'?: string
  'PCOGS+IB-VCCC Check'?: string
  'PCOGS+IB-VFCC Check'?: string
  'CTS Model'?: string
  'CTB Model'?: string
  'Tariff Impact >20%'?: string
  pricing_recommendation?: string
  price_recommendation?: string
  llm_our_product?: string
  llm_our_price?: string
  llm_competitor_product?: string
  llm_competitor_price?: string
  justification?: string
  strategic_priority?: string
  [key: string]: any
}

export async function fetchWorkflowData(): Promise<WorkflowRecord[]> {
  try {
    const response = await fetch('/api/workflow-data', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow data')
    }
    
    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching workflow data:', error)
    return []
  }
}

export function aggregateWorkflowStats(data: WorkflowRecord[]) {
  // Handle if data is not an array
  const records = Array.isArray(data) ? data : [data]
  
  console.log('Aggregating stats for records:', records)
  
  const stats = {
    totalRecords: records.length,
    priceMatch: 0,
    revertToBase: 0,
    comparable: 0,
    underSpec: 0,
    overSpec: 0,
  }

  records.forEach((record) => {
    console.log('Processing record:', record)
    
    // Count price recommendations (check both field names)
    const priceRec =
      record.pricing_recommendation ||
      record.price_recommendation ||
      record["Price Action"] ||
      record.Status
    
    console.log('Price recommendation:', priceRec)
    
    if (priceRec && priceRec.toLowerCase().includes("price match")) {
      stats.priceMatch++
    }
    if (priceRec && priceRec.toLowerCase().includes("revert to base")) {
      stats.revertToBase++
    }

    // Count positioning (spec classifications)
    const positioning = record.positioning || record["Spec Check"]
    console.log('Positioning:', positioning)
    
    if (positioning) {
      const posLower = positioning.toLowerCase()
      if (posLower.includes("comparable")) {
        stats.comparable++
      }
      if (posLower.includes("under-spec") || posLower.includes("underspec")) {
        stats.underSpec++
      }
      if (posLower.includes("over-spec") || posLower.includes("overspec")) {
        stats.overSpec++
      }
    }
  })

  console.log('Final stats:', stats)
  return stats
}
