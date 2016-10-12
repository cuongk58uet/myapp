var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = mongoose.Schema({
    author: String,
      content: String,
      date: { type: Date, default: Date.now }
});
var postSchema = new Schema({
  title: { type: String, required: [true, 'Title cannot be blank']},
  content: {type: String, required:[true, 'Content cannot be blank']},
  author: { type : Schema.Types.ObjectId, ref : 'User' },
  create_date: { type: Date, default: Date.now },
  modified_date: { type: Date, default: Date.now },
  comments: [commentSchema],
  category: String
});

module.exports = mongoose.model('Post', postSchema);
