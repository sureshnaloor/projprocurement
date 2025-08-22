import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('procureflow')
    const collection = db.collection('budgetedval')

    const budgetedValues = await collection.find({}).toArray()

    return NextResponse.json(budgetedValues)
  } catch (error) {
    console.error('Error fetching budgeted values:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgeted values' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('procureflow')
    const collection = db.collection('budgetedval')

    // Add timestamp
    const budgetedValue = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(budgetedValue)

    return NextResponse.json(
      { 
        message: 'Budgeted value created successfully',
        id: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating budgeted value:', error)
    return NextResponse.json(
      { error: 'Failed to create budgeted value' },
      { status: 500 }
    )
  }
}
