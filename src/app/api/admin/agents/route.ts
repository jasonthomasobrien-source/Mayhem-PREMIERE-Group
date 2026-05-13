import { NextResponse } from 'next/server'
import { fetchAgents as dbFetchAgents, createAgent as dbCreateAgent, deleteAgent as dbDeleteAgent } from '@/lib/queries'

const ADMIN_PIN = process.env.ADMIN_PIN

function verifyAdminPin(req: Request): boolean {
  const pin = req.headers.get('x-admin-pin')
  return pin === ADMIN_PIN
}

export async function GET(req: Request) {
  if (!verifyAdminPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

export async function POST(req: Request) {
  if (!verifyAdminPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const agent = await req.json()
    const result = await dbCreateAgent(agent)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
