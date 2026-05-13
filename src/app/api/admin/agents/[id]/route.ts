import { NextResponse, NextRequest } from 'next/server'
import { deleteAgent as dbDeleteAgent } from '@/lib/queries'

const ADMIN_PIN = process.env.ADMIN_PIN

function verifyAdminPin(req: NextRequest): boolean {
  const pin = req.headers.get('x-admin-pin')
  return pin === ADMIN_PIN
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!verifyAdminPin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbDeleteAgent(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
