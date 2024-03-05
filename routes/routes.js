module.exports = function (app, mongoose, passport, async, shippo) {
    mongoose.plugin(require('../plugins/findAndFilter.js'));
    var User = require('../models/user.js').User;
    var Trade = require('../models/trade.js').Trade;
    var TradeRequest = require('../models/tradeRequest.js').TradeRequest;

    app.get('/', function (req, res) {
        if (req.isAuthenticated()) {
            var gender;
            if (req.user.local.gender === 'Male') {
                gender = 'Men';
            }
            else if (req.user.local.gender === 'Female') {
                gender = 'Women';
            }

            var suggestedTrades;
            var tradeRequests;

            async.series([function (callback) {
                Trade.find({
                        'userID': {'$ne': req.user._id},
                        '$or': [{'gender': {'$eq': gender}}, {'gender': {'$eq': 'Unisex'}}],
                        'shoeSize': {'$eq': req.user.local.shoeSize},
                        'amputee': {'$ne': req.user.local.amputee},
                        'open': true
                    },
                    function (err, trades) {

                        if (err) {
                            throw err;
                        }
                        suggestedTrades = trades;
                        callback(null, trades);
                    });
            }, function (callback) {
                TradeRequest.find({'ownerUser': req.user._id})
                    .populate('askingUser')
                    .populate('ownerUser')
                    .populate('offerTrade')
                    .populate('wantedTrade')
                    .exec(function (err, trades) {
                        if (err) {
                            throw err;
                        }
                        tradeRequests = trades;
                        callback(null, trades);
                    });
            }
            ], function (err) {
                if (err) {
                    throw err;
                }
                res.render('index', {
                    title: 'HalfSwap',
                    name: 'Index',
                    suggestedTrades: suggestedTrades,
                    tradeRequests: tradeRequests,
                    authenticated: req.isAuthenticated(),
                    message: req.flash('message'),
                    user: req.user
                });
            });
        }
        else {
            Trade.find({}, function (err, trades) {
                if (err) {
                    throw err;
                }
                res.render('index', {
                    title: 'HalfSwap',
                    name: 'Index',
                    allTrades: trades,
                    authenticated: req.isAuthenticated(),
                    message: req.flash('message'),
                    user: req.user
                });
            }).sort({'_id': -1}).limit(10);
        }
    });

    app.get('/home', function (req, res) {
        res.redirect('/');
    });

    app.get('/index', function (req, res) {
        res.redirect('/');
    });

    app.get('/about', function (req, res) {
        res.render('about', {
            title: 'HalfSwap - About Us',
            name: 'About Us',
            authenticated: req.isAuthenticated(),
            message: req.flash('message'),
            user: req.user
        });
    });

    app.get('/contact', function (req, res) {
        res.render('contact', {
            title: 'HalfSwap - Contact Us',
            name: 'Contact Us',
            authenticated: req.isAuthenticated(),
            message: req.flash('message'),
            user: req.user
        });
    });

    app.get('/trades', function (req, res) {
        let queryParams = req.query;
        let protectedKeys = [];
        let populate = [];
        if (req.isAuthenticated()) {
            let query = {
                'userID': {'$ne': req.user._id},
                'open': true
            };
            Trade.findAndFilter(query, queryParams, protectedKeys, populate, (err, trades) => {
                if (err) {
                    throw err;
                }
                res.render('trades', {
                    title: 'HalfSwap - Trades',
                    name: 'Trades',
                    tradeList: true,
                    allTrades: trades,
                    authenticated: req.isAuthenticated(),
                    user: req.user
                });
            });
        }
        else {
            let query = {
                'open': true
            };
            Trade.findAndFilter(query, queryParams, protectedKeys, populate, (err, trades) => {
                if (err) {
                    throw err;
                }
                res.render('trades', {
                    title: 'HalfSwap - Trades',
                    name: 'Trades',
                    tradeList: true,
                    allTrades: trades,
                    authenticated: req.isAuthenticated(),
                    user: req.user
                });
            });
        }
    });

    app.get('/trades/view/:tradeID', function (req, res) {
        Trade.findOne({'_id': req.params.tradeID}, function (err, trade) {
            if (err) {
                throw err;
            }
            res.render('trades', {
                title: 'HalfSwap - ' + trade.creator + '\'s Trade',
                name: trade.creator + '\'s Trade',
                tradeSingle: true,
                trade: trade,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.get('/trades/new', isLoggedIn, function (req, res) {
        res.render('trades', {
            title: 'HalfSwap - New Trade',
            name: 'New Trade',
            newTrade: true,
            authenticated: req.isAuthenticated(),
            user: req.user
        });
    });

    app.post('/trades/new', function (req, res) {
        var newTrade = new Trade();
        newTrade.userID = req.user._id;
        var today = new Date();
        newTrade.date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
        newTrade.creator = req.user.local.userName;
        newTrade.imgUrl = req.body.imgUrl;
        newTrade.shoeBrand = req.body.shoeBrand;
        newTrade.shoeModel = req.body.shoeModel;
        newTrade.shoeSize = req.body.shoeSize;
        newTrade.gender = req.body.gender;
        newTrade.laceType = req.body.laceType;
        newTrade.amputee = req.body.amputee;
        newTrade.desc = req.body.desc;
        newTrade.quality = req.body.quality;
        newTrade.color = req.body.color;
        newTrade.save(function (err) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/user/trades')
    });

    app.get('/trades/newRequest/:tradeID', isLoggedIn, function (req, res) {
        var userOneID = req.user._id;
        var tradeTwoID = req.params.tradeID;
        var userOneTrades;
        async.series([function (callback) {
            Trade.find({'userID': req.user._id}, function (err, usersTrades) {
                if (err) {
                    return callback(err);
                }
                userOneTrades = usersTrades;
                callback(null, usersTrades);
            });
        }], function (err) {
            if (err) {
                return err;
            }
            res.render('trades', {
                title: 'HalfSwap - New Trade Request',
                name: 'New Trade Request',
                userOneTrades: userOneTrades,
                tradeTwoID: tradeTwoID,
                newTradeRequest: true,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });

    });

    app.post('/trades/newRequest/:tradeOneID/:tradeTwoID', isLoggedIn, function (req, res) {
        var wantedTradeID = req.params.tradeOneID;
        var offerTradeID = req.params.tradeTwoID;

        var wantedTrade;
        var offerTrade;

        var askingUserID;
        var ownerUserID;

        async.series([function (callback) {
            Trade.findOne({'_id': wantedTradeID}, function (err, tOne) {
                if (err) {
                    return callback(err);
                }
                wantedTrade = tOne;
                ownerUserID = tOne.userID;
                callback(null, tOne);

            });
        }, function (callback) {
            Trade.findOne({'_id': offerTradeID}, function (err, tTwo) {
                if (err) {
                    return callback(err);
                }
                offerTrade = tTwo;
                askingUserID = tTwo.userID;
                callback(null, tTwo);
            });
        }
        ], function (err) {
            if (err) {
                return err;
            }
            var newRequest = new TradeRequest();
            newRequest.askingUser = askingUserID;
            newRequest.ownerUser = ownerUserID;
            newRequest.offerTrade = offerTradeID;
            newRequest.wantedTrade = wantedTradeID;
            newRequest.save();
            res.redirect('/user/sentRequests');
        });
    });

    app.get('/trades/requests/accept/:tradeReqID', isLoggedIn, function (req, res) {
        // shippo.carrieraccount.list({}, function (err, doc) {
        //     console.log(doc);
        // });
        TradeRequest.findOne({'_id': req.params.tradeReqID})
            .populate('askingUser')
            .populate('ownerUser')
            .populate('offerTrade')
            .populate('wantedTrade')
            .exec(function (err, tradeReq) {
                if (err) {
                    throw err;
                }
                if (tradeReq.pending) {
                    var ownerUser = tradeReq.ownerUser;
                    var askingUser = tradeReq.askingUser;
                    var addressAskingUser = {
                        "name": ownerUser.local.name.first
                        + " " + ownerUser.local.name.middle
                        + " " + ownerUser.local.name.last,
                        "street1": ownerUser.local.address.street,
                        "city": ownerUser.local.address.city,
                        "state": ownerUser.local.address.state,
                        "zip": ownerUser.local.address.zipCode,
                        "country": "US",
                        "email": ownerUser.local.email,
                    };
                    var addressOwnerUser = {
                        "name": askingUser.local.name.first
                        + " " + askingUser.local.name.middle
                        + " " + askingUser.local.name.last,
                        "street1": askingUser.local.address.street,
                        "city": askingUser.local.address.city,
                        "state": askingUser.local.address.state,
                        "zip": askingUser.local.address.zipCode,
                        "country": "US",
                        "email": askingUser.local.email,
                    };
                    var parcel = {
                        "length": "5",
                        "width": "5",
                        "height": "5",
                        "distance_unit": "in",
                        "weight": "2",
                        "mass_unit": "lb"
                    };

                    var askingToOwnerShipment = {
                        'address_from': addressAskingUser,
                        'address_to': addressOwnerUser,
                        'parcels': [parcel]
                    };

                    var ownerToAskingShipment = {
                        'address_from': addressOwnerUser,
                        'address_to': addressAskingUser,
                        'parcels': [parcel]
                    };

                    shippo.transaction.create({
                        'shipment': askingToOwnerShipment,
                        'servicelevel_token': 'usps_priority',
                        'carrier_account': '7efc0fb502e74bb8bb8e80fe19a9b01f',
                        'label_file_type': 'png'
                    }).then(function (transaction) {
                        if (transaction.status === 'SUCCESS') {
                            console.log('==================== OWNER TO ASKING: ' + transaction.label_url);
                            tradeReq.ownerUserLabel = transaction.label_url;
                            tradeReq.save();
                        }
                    }, function (err) {
                        console.log('There was an error creating transaction : %s', err.detail);
                    });

                    shippo.transaction.create({
                        'shipment': ownerToAskingShipment,
                        'servicelevel_token': 'usps_priority',
                        'carrier_account': '7efc0fb502e74bb8bb8e80fe19a9b01f',
                        'label_file_type': 'png'
                    }).then(function (transaction) {
                        if (transaction.status === 'SUCCESS') {
                            console.log('==================== ASKING TO OWNER: ' + transaction.label_url);
                            tradeReq.askingUserLabel = transaction.label_url;
                            tradeReq.save();
                        }
                    }, function (err) {
                        console.log('There was an error creating transaction : %s', err.detail);
                    });
                    tradeReq.pending = false;
                    tradeReq.offerTrade.open = false;
                    tradeReq.wantedTrade.open = false;
                    tradeReq.offerTrade.save();
                    tradeReq.wantedTrade.save();
                    tradeReq.save();
                }
                res.redirect('/trades/requests/view/' + req.params.tradeReqID);
            });
    });

    app.get('/trades/requests/decline/:tradeReqID', isLoggedIn, function (req, res) {
        TradeRequest.deleteOne({'_id': req.params.tradeReqID}, function (err, trade) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/user/receivedRequests');
    });

    app.get('/trades/requests/cancel/:tradeReqID', isLoggedIn, function (req, res) {
        TradeRequest.deleteOne({'_id': req.params.tradeReqID}, function (err, trade) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/user/sentRequests');
    });

    app.get('/trades/requests/view/:tradeReqID', isLoggedIn, function (req, res) {
        TradeRequest.findOne({'_id': req.params.tradeReqID})
            .populate('askingUser')
            .populate('ownerUser')
            .populate('offerTrade')
            .populate('wantedTrade')
            .exec(function (err, tradeReq) {
                if (err) {
                    throw err;
                }
                res.render('trades', {
                    title: 'HalfSwap - Trade Request',
                    name: 'Trade Request',
                    tradeRequest: tradeReq,
                    tradeRequestView: true,
                    authenticated: req.isAuthenticated(),
                    user: req.user
                });
            });
    });

    app.get('/user', function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/user/profile');
        }
        else {
            res.render('user', {
                title: 'HalfSwap - User Welcome!',
                name: 'Welcome!',
                register: false,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        }
    });

    app.get('/user/profile', isLoggedIn, function (req, res) {
        var numRec = '';
        var numSen = '';
        async.series([function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            res.render('user', {
                title: 'HalfSwap - My Profile',
                name: 'My Profile',
                loggedIn: isLoggedIn,
                userProfile: true,
                tradeRequestView: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.get('/user/update', isLoggedIn, function (req, res) {
        var numRec = '';
        var numSen = '';
        async.series([function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            res.render('user', {
                title: 'HalfSwap - Edit My Profile',
                name: 'Update My Profile',
                loggedIn: isLoggedIn,
                userUpdate: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            })
        });
    });

    app.post('/user/update', isLoggedIn, function (req, res) {
        User.findOne({'_id': req.user._id}, function (err, doc) {
            if (err) {
                throw err;
            }
            doc.local.name.first = req.body.firstName;
            doc.local.name.middle = req.body.middleName;
            doc.local.gender = req.body.gender;
            doc.local.name.last = req.body.lastName;
            doc.local.address.street = req.body.street;
            doc.local.address.city = req.body.city;
            doc.local.address.state = req.body.state;
            doc.local.address.zipCode = req.body.zipCode;
            doc.local.shoeSize = req.body.shoeSize;
            doc.local.amputee = req.body.amputee;
            doc.save();
        });
        res.redirect('/user/profile');
    });

    app.get('/user/trades', isLoggedIn, function (req, res) {
        var userTrades;
        var numRec = '';
        var numSen = '';
        async.series([function (callback) {
            Trade.find({'userID': req.user._id}, function (err, trades) {
                if (err) {
                    throw err;
                }
                userTrades = trades;
                callback(null, trades);
            });
        }, function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            res.render('user', {
                title: 'HalfSwap - My Trades',
                name: 'My Trades',
                allTrades: userTrades,
                loggedIn: isLoggedIn,
                userTrades: true,
                viewUserTrades: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.get('/user/trades/update/:tradeID', isLoggedIn, function (req, res) {
        var updateTrade;
        var numRec = '';
        var numSen = '';
        async.series([function (callback) {
            Trade.findOne({'_id': req.params.tradeID}, function (err, trade) {
                if (err) {
                    throw err;
                }
                updateTrade = trade;
                callback(null, trade);
            });
        }, function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            res.render('user', {
                title: 'HalfSwap - Edit Trade',
                name: 'Edit Trade',
                trade: updateTrade,
                loggedIn: isLoggedIn,
                userTrades: true,
                editUserTrade: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.post('/user/trades/update/:tradeID', isLoggedIn, function (req, res) {
        Trade.findOne({'_id': req.params.tradeID}, function (err, trade) {
            if (err) {
                throw err;
            }
            trade.shoeBrand = req.body.shoeBrand;
            trade.shoeModel = req.body.shoeModel;
            trade.gender = req.body.gender;
            trade.shoeSize = req.body.shoeSize;
            trade.color = req.body.color;
            trade.amputee = req.body.amputee;
            trade.laceType = req.body.laceType;
            trade.desc = req.body.desc;
            trade.quality = req.body.quality;
            trade.save();
            res.redirect('/trades/view/' + trade._id);
        });
    });

    app.get('/user/trades/delete/:tradeID', isLoggedIn, function (req, res) {
        Trade.deleteOne({'_id': req.params.tradeID}, function (err, trade) {
            if (err) {
                throw err;
            }
        });
        res.redirect('/user/trades');
    });

    app.get('/user/receivedRequests', isLoggedIn, function (req, res) {
        var allReceivedRequests;
        var numRec = '';
        var numSen = '';

        async.series([function (callback) {
            TradeRequest.find({'ownerUser': req.user._id})
                .populate('askingUser')
                .populate('ownerUser')
                .populate('offerTrade')
                .populate('wantedTrade')
                .exec(function (err, tradeIDs) {
                    allReceivedRequests = tradeIDs;
                    callback(null, tradeIDs);
                });
        }, function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            if (err) {
                throw err;
            }
            res.render('user', {
                title: 'HalfSwap - My Received Trade Requests',
                name: 'My Received Trade Requests',
                tradeRequests: allReceivedRequests,
                loggedIn: isLoggedIn,
                receivedTradeReqs: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.get('/user/sentRequests', isLoggedIn, function (req, res) {
        var allReceivedRequests;
        var numRec = '';
        var numSen = '';

        async.series([function (callback) {
            TradeRequest.find({'askingUser': req.user._id})
                .populate('askingUser')
                .populate('ownerUser')
                .populate('offerTrade')
                .populate('wantedTrade')
                .exec(function (err, tradeIDs) {
                    allReceivedRequests = tradeIDs;
                    callback(null, tradeIDs);
                });
        }, function (callback) {
            TradeRequest.find({
                'ownerUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numRec = reqs.length;
                }
                callback(null, reqs);
            });
        }, function (callback) {
            TradeRequest.find({
                'askingUser': req.user._id,
                'pending': true
            }, function (err, reqs) {
                if (reqs.length > 0) {
                    numSen = reqs.length;
                }
                callback(null, reqs);
            });
        }], function (err) {
            if (err) {
                throw err;
            }
            res.render('user', {
                title: 'HalfSwap - My Sent Trade Requests',
                name: 'My Sent Trade Requests',
                tradeRequests: allReceivedRequests,
                loggedIn: isLoggedIn,
                sentTradeReqs: true,
                tradeRecCount: numRec,
                tradeSenCount: numSen,
                authenticated: req.isAuthenticated(),
                user: req.user
            });
        });
    });

    app.get('/user/login', function (req, res) {
        res.render('user', {
            title: 'HalfSwap - Login',
            name: 'User Login',
            message: req.flash('loginMessage'),
            authenticated: req.isAuthenticated(),
            login: true
        });
    });

    app.post('/user/login', passport.authenticate('local-login', {
        successRedirect: '/user/profile',
        failureRedirect: '/user/login',
        failureFlash: true
    }));

    app.get('/user/signup', function (req, res) {
        res.render('user', {
            title: 'HalfSwap - New User Signup',
            name: 'New User Signup',
            message: req.flash('signupMessage'),
            authenticated: req.isAuthenticated(),
            signup: true
        });
    });

    app.post('/user/signup', passport.authenticate('local-signup', {
        successRedirect: '/user/profile',
        failureRedirect: '/user/signup',
        failureFlash: true
    }));

    app.get('/user/logout', function (req, res) {
        req.logout();
        res.redirect('back');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('/user');
    }

    function getNumReq(req) {
        var rVal = '';
        async.series([function (callback) {
            TradeRequest.find({'ownerUser': req.user._id}, function (err, reqs) {
                if (err) {
                    return callback(err);
                }
                rVal = reqs.length;
                callback(null, reqs);
            });
        }], function (err) {
            if (err) {
                return err;
            }
            return rVal;
        });

    }
};
