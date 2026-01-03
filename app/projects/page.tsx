'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

// Type definition for Project
type Project = {
    _id: string
    'project-name': string
    'project-wbs': string
}

// Zod schema for form validation
const formSchema = z.object({
    projectName: z.string().min(3, 'Project name must be at least 3 characters'),
    projectWbs: z.string().min(3, 'Project WBS must be at least 3 characters'),
})

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    const queryClient = useQueryClient()

    // Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: '',
            projectWbs: '',
        },
    })

    // Fetch projects
    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await fetch('/api/projects')
            if (!response.ok) throw new Error('Failed to fetch projects')
            return response.json()
        },
    })

    // Create project mutation
    const createMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create project')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            setIsDialogOpen(false)
            form.reset()
            toast.success('Project created successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    // Update project mutation
    const updateMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            if (!editingProject) return

            const response = await fetch(`/api/projects/${editingProject._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update project')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            setIsDialogOpen(false)
            setEditingProject(null)
            form.reset()
            toast.success('Project updated successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    // Delete project mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete project')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Project deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (editingProject) {
            updateMutation.mutate(values)
        } else {
            createMutation.mutate(values)
        }
    }

    const handleEdit = (project: Project) => {
        setEditingProject(project)
        form.reset({
            projectName: project['project-name'],
            projectWbs: project['project-wbs'],
        })
        setIsDialogOpen(true)
    }

    const handleAddNew = () => {
        setEditingProject(null)
        form.reset({
            projectName: '',
            projectWbs: '',
        })
        setIsDialogOpen(true)
    }

    // Filter projects based on search term (client-side for now)
    const filteredProjects = projects?.filter(project =>
        project['project-name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        project['project-wbs'].toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Projects Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your projects and WBS codes</p>
                </div>
                <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Add New Project
                </Button>
            </div>

            <div className="space-y-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 bg-slate-900 border-gray-700 focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-gray-800 rounded-lg overflow-hidden bg-slate-900/50 backdrop-blur-sm shadow-xl">
                    <Table>
                        <TableHeader className="bg-slate-900 text-gray-400">
                            <TableRow className="border-b border-gray-800 hover:bg-slate-900/80">
                                <TableHead>Project Name</TableHead>
                                <TableHead>WBS Code</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProjects?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                                        No projects found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProjects?.map((project) => (
                                    <TableRow key={project._id} className="border-b border-gray-800/50 hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium text-gray-200">
                                            {project['project-name']}
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            <span className="bg-slate-800 px-2 py-1 rounded text-xs font-mono border border-gray-700">
                                                {project['project-wbs']}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(project)}
                                                    className="hover:text-blue-400 hover:bg-blue-400/10"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this project?')) {
                                                            deleteMutation.mutate(project._id)
                                                        }
                                                    }}
                                                    className="hover:text-red-400 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-gray-800 text-gray-100">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {editingProject ? 'Modify existing project details.' : 'Enter details for the new project.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="projectName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Gateway Towers" {...field} className="bg-slate-800 border-gray-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectWbs"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WBS Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. GT-001" {...field} className="bg-slate-800 border-gray-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
