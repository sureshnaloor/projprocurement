import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import PurchaseRequisition from '@/lib/models/PurchaseRequisition'
import mongoose from 'mongoose'

// POST - Add a communication log to a purchase requisition
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase requisition ID' },
        { status: 400 }
      )
    }
    
    const { user, log } = await request.json()
    
    if (!user || !log) {
      return NextResponse.json(
        { success: false, error: 'User and log message are required' },
        { status: 400 }
      )
    }
    
    const purchaseRequisition = await PurchaseRequisition.findByIdAndUpdate(
      id,
      {
        $push: {
          communication: {
            user,
            log,
            timestamp: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    )
    
    if (!purchaseRequisition) {
      return NextResponse.json(
        { success: false, error: 'Purchase requisition not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: purchaseRequisition
    })
  } catch (error) {
    console.error('Error adding communication log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add communication log' },
      { status: 500 }
    )
  }
}
