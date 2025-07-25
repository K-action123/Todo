const mongoose=  require('mongoose');
const subtaskSchema = new mongoose.Schema({
    subtaskText:{
        type:String,
        required:true,
        trim:true
    },
    isCompleted:{
        type:Boolean,
        default: false
    },
})
const todoSchema = new mongoose.Schema({
    task:{
        type:String,
        required: true,
        trim:true
    },
    description:{
        type:String,        
        trim:true,
        default: ''
    },
    subtasks:[subtaskSchema],       
    completed:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports= mongoose.model("Todo", todoSchema);