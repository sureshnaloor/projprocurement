import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Project from '@/lib/models/Project'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        await dbConnect()
        const body = await request.json()

        // Transform camelCase to db field names
        const updateData = {
            'project-name': body.projectName,
            'project-wbs': body.projectWbs
        }

        const project = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(project)
    } catch (error: any) {
        console.error('Error updating project:', error)

        // Check for duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'A project with this WBS already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        await dbConnect()
        const project = await Project.findByIdAndDelete(id)

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}
