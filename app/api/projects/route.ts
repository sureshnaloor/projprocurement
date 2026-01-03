import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Project from '@/lib/models/Project'

export async function GET() {
    try {
        await dbConnect()
        const projects = await Project.find({}).sort({ 'project-name': 1 })
        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const body = await request.json()

        // Transform incoming camelCase to database snake-case if needed, 
        // but schema uses 'project-name' and 'project-wbs'
        const projectData = {
            'project-name': body.projectName,
            'project-wbs': body.projectWbs
        }

        const project = await Project.create(projectData)

        return NextResponse.json(project, { status: 201 })
    } catch (error: any) {
        console.error('Error creating project:', error)

        // Check for duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'A project with this WBS already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
