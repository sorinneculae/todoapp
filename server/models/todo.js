const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  name: String,
  completed: Boolean,
  listId: String
})

module.exports = mongoose.model('ToDo', todoSchema);