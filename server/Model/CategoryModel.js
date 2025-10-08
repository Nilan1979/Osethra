const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    timestamps: true 
});

// Note: unique: true on 'name' field automatically creates an index
// No need to define categorySchema.index({ name: 1 })

module.exports = mongoose.model('Category', categorySchema);
