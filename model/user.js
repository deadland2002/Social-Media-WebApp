const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    contact: {type:Number, required:true, unique:true},
    coins: {type:Number,"default":0},
    posts : [{
        title: {type: String,"default" : ""},
        content: {type: String,"default" : ""},
        url: {type: String,"default" : ""},
        comment: {type : Array , "default" : [] }
    }],
    friends : [{
        name: {type: String,"default" : ""},
        id: {type: String,"default" : ""}
    }]
}, { collection: 'users' })

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;