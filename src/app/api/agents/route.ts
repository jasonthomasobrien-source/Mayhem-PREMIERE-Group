import { NextResponse } from 'next/server'
import { fetchAgents as dbFetchAgents } from '@/lib/queries'

export async function GET() {
  try {
    const agents = await dbFetchAgents()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
