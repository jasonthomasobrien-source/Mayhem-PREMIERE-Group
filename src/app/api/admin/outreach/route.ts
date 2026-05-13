import { NextResponse } from 'next/server'
import { fetchAllOutreach } from '@/lib/queries'

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
    const outreach = await fetchAllOutreach()
    return NextResponse.json(outreach)
  } catch (error) {
    console.error('Error fetching outreach:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach' },
      { status: 500 }
    )
  }
}
