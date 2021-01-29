const mongoose        = require('mongoose');
const UserSchema = new mongoose.Schema({
    
    googleID  : { 
      type : String,
      required : true,
    }
  
  });

const Users = mongoose.model('Users', UserSchema);
module.exports = Users;