import { NextResponse } from 'next/server'
import { fetchOutreach as dbFetchOutreach, insertOutreach as dbInsertOutreach, getOutreachDailyAggregates } from '@/lib/queries'
import { OutreachRow } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const agentId = url.searchParams.get('agent_id')
    const isAggregates = url.searchParams.get('aggregates') === 'true'

    if (isAggregates) {
      const aggregates = await getOutreachDailyAggregates(agentId || undefined)
      return NextResponse.json(aggregates)
    }

    const outreach = await dbFetchOutreach()
    return NextResponse.json(outreach)
  } catch (error) {
    console.error('Error fetching outreach:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const records = await req.json()
    const result = await dbInsertOutreach(records)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error inserting outreach:', error)
    return NextResponse.json(
      { error: 'Failed to insert outreach' },
      { status: 500 }
    )
  }
}
