import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const client = await clientPromise
    const db = client.db('procureflow')
    const collection = db.collection('budgetedval')

    const budgetedValue = await collection.findOne({
      _id: new ObjectId(params.id)
    })

    if (!budgetedValue) {
      return NextResponse.json(
        { error: 'Budgeted value not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(budgetedValue)
  } catch (error) {
    console.error('Error fetching budgeted value:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgeted value' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('procureflow')
    const collection = db.collection('budgetedval')

    // Add updated timestamp
    const updatedBudgetedValue = {
      ...body,
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updatedBudgetedValue }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Budgeted value not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Budgeted value updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating budgeted value:', error)
    return NextResponse.json(
      { error: 'Failed to update budgeted value' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const client = await clientPromise
    const db = client.db('procureflow')
    const collection = db.collection('budgetedval')

    const result = await collection.deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Budgeted value not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Budgeted value deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting budgeted value:', error)
    return NextResponse.json(
      { error: 'Failed to delete budgeted value' },
      { status: 500 }
    )
  }
}
