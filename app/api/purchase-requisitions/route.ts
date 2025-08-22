import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import PurchaseRequisition from '@/lib/models/PurchaseRequisition'
import { ObjectId } from 'mongodb'

// GET - Fetch all purchase requisitions
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const projectName = searchParams.get('projectName')
    const prNumber = searchParams.get('prNumber')
    const budgetedValueId = searchParams.get('budgetedValueId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build filter object
    let filter: any = {}
    if (projectName) {
      filter.projectName = { $regex: projectName, $options: 'i' }
    }
    if (prNumber) {
      filter.prNumber = { $regex: prNumber, $options: 'i' }
    }
    if (budgetedValueId) {
      filter.budgetedValueId = new ObjectId(budgetedValueId)
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Fetch purchase requisitions with pagination
    const purchaseRequisitions = await PurchaseRequisition
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    // Get total count for pagination
    const total = await PurchaseRequisition.countDocuments(filter)
    
    return NextResponse.json({
      success: true,
      data: purchaseRequisitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching purchase requisitions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase requisitions' },
      { status: 500 }
    )
  }
}

// POST - Create a new purchase requisition
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Convert budgetedValueId to ObjectId if provided
    if (body.budgetedValueId) {
      body.budgetedValueId = new ObjectId(body.budgetedValueId)
    }
    
    // Business rule: When PO is created, PR value should equal PO value
    if (body.poCreated && body.poValue && body.poValue > 0) {
      body.prValue = body.poValue
    }
    
    // Create new purchase requisition
    const purchaseRequisition = new PurchaseRequisition(body)
    await purchaseRequisition.save()
    
    return NextResponse.json({
      success: true,
      data: purchaseRequisition
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create purchase requisition' },
      { status: 500 }
    )
  }
}
