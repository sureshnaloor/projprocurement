import mongoose from 'mongoose'

// Communication log schema
const CommunicationLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  log: {
    type: String,
    required: true
  }
})

// Purchase Requisition schema - Clean version with only required fields
const PurchaseRequisitionSchema = new mongoose.Schema({
  // Reference to budgeted value
  budgetedValueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetedValue',
    required: true
  },
  // Project information (from budgeted value)
  projectName: {
    type: String,
    required: true
  },
  projectWbs: {
    type: String,
    required: true
  },
  materialServiceWbs: {
    type: String,
    required: true
  },
  materialService: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  
  // PR information (user input)
  prNumber: {
    type: String,
    required: true
  },
  lineItemNumber: {
    type: String,
    required: true
  },
  prDate: {
    type: String,
    required: true
  },
  prValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // PO information (optional)
  poNumber: {
    type: String,
    default: null
  },
  poDate: {
    type: String,
    default: null
  },
  poValue: {
    type: Number,
    default: null,
    min: 0
  },
  poCompleted: {
    type: Boolean,
    default: false
  },
  poCreated: {
    type: Boolean,
    default: false
  },
  
  // Additional information
  remarks: {
    type: String,
    default: ""
  },
  communication: [CommunicationLogSchema],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
PurchaseRequisitionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Export the model - Force refresh by using a different name temporarily
export default mongoose.models.PurchaseRequisitionV2 || 
  mongoose.model('PurchaseRequisitionV2', PurchaseRequisitionSchema, 'purchaserequisitions_v2')
