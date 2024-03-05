var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;
var bcrypt = require('bcrypt-nodejs');

var tradeSchema = Schema({
    userID: {
        type: String, 
        trim: true
    },
    creator: {
        type: String, 
        trim: true
    },
    date: {
        type: String, 
        trim: true
    },
    imgUrl: {
        type: String, 
        trim: true
    },
    shoeBrand: {
        type: String, 
        trim: true
    },
    shoeModel: {
        type: String, 
        trim: true
    },
    gender: {
        type: String, 
        trim: true
    },
    shoeSize: {
        type: String, 
        trim: true
    },
    color: {
        type: String, 
        trim: true
    },
    amputee: {
        type: String, 
        trim: true
    },
    laceType: {
        type: String, 
        trim: true
    },
    quality: {
        type: String, 
        trim: true
    },
    desc: {
        type: String, 
        trim: true
    },
    open: {
        type: Boolean,
        default: true
    }
});

tradeSchema.index({
    shoeBrand: 'text',
    shoeModel: 'text',
    shoeSize: 'text',
    amputee: 'text',
    laceType: 'text',
    quality: 'text',
    gender: 'text',
    color: 'text'
}
);
Trade = mongoose.model('trades', tradeSchema);

// module.exports = mongoose.model('trade', tradeSchema);
module.exports.Trade = Trade;
module.exports.Schema = tradeSchema;
