var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectID = Schema.ObjectId;
var bcrypt = require('bcrypt-nodejs');

var usersSchema = mongoose.Schema({
    local: {
        userName: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        name: {
            first: {
                type:
                String,
                trim: true
            },
            middle: {
                type: String,
                trim: true
            },
            last: {
                type: String,
                trim: true
            }
        },
        gender: {
            type: String,
            trim: true
        },
        address: {
            street: {
                type: String,
                trim: true
            },
            city: {
                type: String,
                trim: true
            },
            state: {
                type: String,
                trim: true
            },
            zipCode: {
                type: Number,
                trim: true
            },
        },
        shoeSize: {
            type: String,
            trim: true
        },
        amputee: {
            type: String,
            trim: true
        }
    },

    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        userName: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

usersSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

usersSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

User = mongoose.model('users', usersSchema);

// module.exports = mongoose.model('user', usersSchema);
module.exports.User = User;
module.exports.Schema = usersSchema;
