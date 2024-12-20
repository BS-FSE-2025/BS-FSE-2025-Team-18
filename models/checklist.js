const checklistSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Unique identifier for the user
    tasks: [String], // Array of tasks
  });
  
  const Checklist = mongoose.model('Checklist', checklistSchema);
  