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

// Purchase Requisition schema
const PurchaseRequisitionSchema = new mongoose.Schema({
  // Project information
  projectName: {
    type: String,
    required: true
  },
  projectWbs: {
    type: String,
    required: true
  },
  
  // Material/Service information
  materialServiceWbs: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  
  // PR information
  prNumber: {
    type: String,
    required: true
  },
  lineItemNumber: {
    type: String,
    required: true
  },
  prMaterialServiceCode: {
    type: String,
    required: true
  },
  prMaterialServiceDescription: {
    type: String,
    required: true
  },
  
  // Quantity and measure
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitOfMeasure: {
    type: String,
    required: true
  },
  
  // PO information
  prConvertedToPo: {
    type: Boolean,
    default: false
  },
  poNumber: {
    type: String,
    default: null
  },
  poLineItem: {
    type: String,
    default: null
  },
  
  // Financial
  materialServiceValueSar: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Additional information
  remarks: {
    type: String,
    default: ""
  },
  communication: [CommunicationLogSchema],
  
  // Delivery status
  poDelivered: {
    type: Boolean,
    default: false
  },
  
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

// Export the model
export default mongoose.models.PurchaseRequisition || 
  mongoose.model('PurchaseRequisition', PurchaseRequisitionSchema)
