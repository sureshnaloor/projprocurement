import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import PurchaseRequisition from '@/lib/models/PurchaseRequisition'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

// GET - Fetch a specific purchase requisition
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase requisition ID' },
        { status: 400 }
      )
    }
    
    const purchaseRequisition = await PurchaseRequisition.findById(params.id)
    
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
    console.error('Error fetching purchase requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase requisition' },
      { status: 500 }
    )
  }
}

// PUT - Update a purchase requisition
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase requisition ID' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Convert budgetedValueId to ObjectId if provided
    if (body.budgetedValueId) {
      body.budgetedValueId = new ObjectId(body.budgetedValueId)
    }
    
    // Business rule: When PO is created, PR value should equal PO value
    if (body.poCreated && body.poValue && body.poValue > 0) {
      body.prValue = body.poValue
    }
    
    const purchaseRequisition = await PurchaseRequisition.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
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
    console.error('Error updating purchase requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase requisition' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a purchase requisition
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase requisition ID' },
        { status: 400 }
      )
    }
    
    const purchaseRequisition = await PurchaseRequisition.findByIdAndDelete(params.id)
    
    if (!purchaseRequisition) {
      return NextResponse.json(
        { success: false, error: 'Purchase requisition not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Purchase requisition deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting purchase requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete purchase requisition' },
      { status: 500 }
    )
  }
}
