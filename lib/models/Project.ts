import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    'project-name': {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    'project-wbs': {
        type: String,
        required: [true, 'Project WBS is required'],
        trim: true,
        unique: true
    }
}, {
    timestamps: true,
    collection: 'projects' // Explicitly set collection name
})

// Check if model already exists to prevent overwrite warning during hot reload
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)

export default Project
