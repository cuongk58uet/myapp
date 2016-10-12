var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
  username: {type: String, required:[true, 'Username cannot be blank']},
  password: String,
  display_name: {type: String, default: 'New User'},
  address: {type: String, default: 'Việt Nam'},
  avatar: {type: String, default: '/avatar/avatar-default.jpg'}
  // admin: Boolean
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
