import { NextResponse, NextRequest } from 'next/server'
import { deleteOutreachRecord } from '@/lib/queries'

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
    await deleteOutreachRecord(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting outreach:', error)
    return NextResponse.json(
      { error: 'Failed to delete outreach' },
      { status: 500 }
    )
  }
}
