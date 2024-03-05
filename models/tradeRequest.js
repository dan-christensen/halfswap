var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var tradeRequestSchema = mongoose.Schema({
    askingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    ownerUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    offerTrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trades'
    },
    wantedTrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trades'
    },
    pending: {
        type: Boolean,
        default: true
    },
    askingUserLabel: {
        type: String
    },
    ownerUserLabel: {
        type: String
    },
});

TradeRequest = mongoose.model('traderequests', tradeRequestSchema);

// module.exports = mongoose.model('tradeRequest', tradeRequestSchema);
module.exports.TradeRequest = TradeRequest;
module.exports.Schema = tradeRequestSchema;
