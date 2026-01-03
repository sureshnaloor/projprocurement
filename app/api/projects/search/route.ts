import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'project' or 'wbs'

    if (!query || query.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 3 characters long'
      }, { status: 400 })
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }

    // Parse the MongoDB URI to get the base connection string without database name
    const uri = process.env.MONGODB_URI!
    const baseUri = uri.replace(/\/[^\/]+$/, '') // Remove the database name from the end
    
    const client = new MongoClient(baseUri)
    await client.connect()

    const db = client.db('mmportal')
    const collection = db.collection('projects')

    // Create search filter based on type
    let filter = {}
    if (type === 'project') {
      filter = {
        'project-name': { $regex: query, $options: 'i' }
      }
    } else if (type === 'wbs') {
      filter = {
        'project-wbs': { $regex: query, $options: 'i' }
      }
    } else {
      // Search both project name and WBS
      filter = {
        $or: [
          { 'project-name': { $regex: query, $options: 'i' } },
          { 'project-wbs': { $regex: query, $options: 'i' } }
        ]
      }
    }

    const results = await collection
      .find(filter)
      .limit(10)
      .toArray()

    await client.close()

    // Extract unique values based on type
    let uniqueResults: Array<{
      id: string
      value: string
      type?: 'project' | 'wbs'
      projectName?: string
      wbs?: string
    }> = []
    if (type === 'project') {
      const projectNames = new Set()
      results.forEach(doc => {
        const projectName = doc['project-name']
        if (projectName && !projectNames.has(projectName)) {
          projectNames.add(projectName)
          uniqueResults.push({
            id: doc._id.toString(),
            value: projectName,
            wbs: doc['project-wbs']
          })
        }
      })
    } else if (type === 'wbs') {
      const wbsCodes = new Set()
      results.forEach(doc => {
        const wbsCode = doc['project-wbs']
        if (wbsCode && !wbsCodes.has(wbsCode)) {
          wbsCodes.add(wbsCode)
          uniqueResults.push({
            id: doc._id.toString(),
            value: wbsCode,
            projectName: doc['project-name']
          })
        }
      })
    } else {
      // Return both project names and WBS codes
      const projectNames = new Set()
      const wbsCodes = new Set()
      
      results.forEach(doc => {
        const projectName = doc['project-name']
        const wbsCode = doc['project-wbs']
        
        if (projectName && !projectNames.has(projectName)) {
          projectNames.add(projectName)
          uniqueResults.push({
            id: doc._id.toString(),
            type: 'project',
            value: projectName,
            wbs: wbsCode
          })
        }
        
        if (wbsCode && !wbsCodes.has(wbsCode)) {
          wbsCodes.add(wbsCode)
          uniqueResults.push({
            id: doc._id.toString(),
            type: 'wbs',
            value: wbsCode,
            projectName: projectName
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: uniqueResults
    })

  } catch (error) {
    console.error('Error searching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search projects' },
      { status: 500 }
    )
  }
}
