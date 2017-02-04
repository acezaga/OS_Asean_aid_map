var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var user = mongoose.model('accounts');
var passport = require('passport');
var notification = mongoose.model('Notifications');
var faq = mongoose.model('FAQ');

module.exports = function(passport) {

    router.post('/register', function (req, res, next) {

        console.log(req.body.description);

        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('confirmPassword', 'Confirm Password is required').notEmpty();
        req.checkBody('orgname', 'Organization Name is required').notEmpty();
        req.checkBody('email', 'Email is required').isEmail();
        req.checkBody('country', 'Country is required').notEmpty();
        req.checkBody('description', 'Description is required').notEmpty();
        req.checkBody('confirmPassword', 'Does not match').equals(req.body.password);

        var errors = req.validationErrors();

        if (errors) {
            res.send({status: false, message: errors});
            //res.send(errors);
        }
        else {
            user.findOne({
                'username': req.body.username
            }, function (err, foundUser) {
                if (err) {
                    //return res.send({status: false, message: err});
                    return res.send(err);
                }
                if (foundUser) {
                    return res.send({status: false, message: "Username already exists!"});
                }
                else {
                    var newUser = new user();
                    newUser.username = req.body.username;
                    newUser.password = createHash(req.body.password);
                    newUser.orgname = req.body.orgname;
                    newUser.contacts.email = req.body.email;
                    newUser.country = req.body.country;
                    newUser.description = req.body.description;

                    newUser.save(function (err, savedUser) {
                        if (err) {
                            return res.send(err);
                        }
                        return res.send({status: true, account: savedUser});
                    });
                }
            });
        }
    });

    var createHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    }

    router.post('/login', passport.authenticate('signin', {
        successRedirect: '/user/success',
        failureRedirect: '/user/failure'
    }), function (req, res, next) {
        
    });

    router.get('/success', function (req, res) {
        delete req.user.password;
        return res.send({status: true, account: req.user});
    });

    router.get('/failure', function (req, res) {
        return res.send({status: false, message: "Invalid login"});
    });

    router.put('/saveChanges/', function(req, res, next){

        console.log("body: " + req.body.account);

        var updatesDetail = req.body.account;

        user.findOne({_id: updatesDetail._id}, function(err, foundUser){
            if(err){
                return res.send({status: false, message: err});
            }
            else if(!foundUser){
                return res.send({status: false, message: "user not found"});
            }

            console.log(foundUser);

            foundUser.description = updatesDetail.description;
            foundUser.mission = updatesDetail.mission;
            foundUser.vision = updatesDetail.vision;
            foundUser.orgname = updatesDetail.orgname;
            foundUser.country = updatesDetail.country;
            foundUser.address = updatesDetail.address;
            foundUser.sectors = updatesDetail.sectors;
            foundUser.contacts = updatesDetail.contacts;
            foundUser.awards = updatesDetail.awards;
            foundUser.resources = updatesDetail.resources;
            foundUser.picture = updatesDetail.picture;

            foundUser.save(function(err, updatedUser){
                if(err)
                    return res.send({status: false, message: err});
                else
                    return res.send({status: true, account: updatedUser});

            });
        });
    });

    router.get('/creator/:id', function(req, res, next){
        var id = req.params.id;

        console.log('project creator params: '+ id);

        user.findOne({_id: id}, function(err, foundUser){
            if(err){
                return res.send(err);
            }
            else if(!foundUser){
                return res.send('Not Found');
            }

            return res.send(foundUser);
        });
    });

    router.get('/orgprofile/:name', function(req, res, next){
        var name = req.params.name;

        user.findOne({username: name}, function(err, foundUser){
            if(err){
                return res.send({status: false, error: err});
            }
            if(!foundUser){
                return res.send({status: false});
            }

            return res.send({status: true, account: foundUser});
        })
    });

    router.post('/connectionInfo', function(req, res, next){

        user.find({_id: {$in: req.body.connections}}, function(err, foundUsers){
            if(err){
                console.log(err);
                return res.send(err);
            }
            console.log('connection info: '+foundUsers);
            return res.send(foundUsers);
        });

    });

    router.get('/notifications/:id', function(req,res,next){
        notification.find({$or: [{'to.id': req.params.id},{'from.id': req.params.id}], cancelled: "false"}, function(err, foundNotifications){
            if(err){
                return res.send(err);
            }

            console.log('notification:' + foundNotifications);

            return res.send(foundNotifications);
        });
    });

    router.post('/connReqCheck', function(req, res, next){
        console.log('check request body: '+ req.body.fromId);

        notification.find({'from.id': req.body.fromId, 'to.id': req.body.toId, type: 'AddConnection', answered: "false", cancelled: "false"}, function(err, foundNotification){

            if(err){
                return res.send(false);
            }
            if(foundNotification.length == 0){
                return res.send(false);
            }
            else {
                console.log('return true: '+ foundNotification);
                return res.send(true);
            }
        });
    });

    router.post('/connPendingCheck', function(req, res, next){
        console.log('check request body: '+ req.body.fromId);

        notification.find({'from.id': req.body.fromId, 'to.id': req.body.toId, type: 'AddConnection', answered: "false", cancelled: "false"}, function(err, foundNotification){

            if(err){
                return res.send(false);
            }
            if(foundNotification.length == 0){
                return res.send(false);
            }
            else {
                console.log('return true: '+ foundNotification);
                return res.send(true);
            }
        });
    });

    router.post('/invitedCollabCheck', function(req, res, next){
        console.log('gathering invited accounts');

        notification.find({'from.id': req.body.account, 'from.project.id': req.body.project, type: 'InviteCollaboration', answered: "false", cancelled: "false"},'to', function(err, foundNotif){
            if(err){
                return res.send(false);
            }
            if(foundNotif.length == 0){
                return res.send(false);
            }

            console.log('notif invites: '+JSON.stringify(foundNotif));

            var invitedAccounts = [];

            for(i = 0; i < foundNotif.length; i++){
                invitedAccounts.push(foundNotif[i].to.id);
            }

            user.find({_id: {$in: invitedAccounts}}, function(err, foundUsers){
                if(err){
                    console.log(err);
                    return res.send(err);
                }

                console.log('invited accounts: '+JSON.stringify(foundUsers));

                return res.send({status: true, accounts: foundUsers});
            });
        });
    });

    router.post('/suggestedAccountsToAccount', function(req, res, next){
        var criteria = {};
        criteria.location = req.body.account.country;
        criteria.resources = req.body.account.resources;
        criteria.connections = req.body.account.collaboration;
        criteria.sectors = req.body.account.sector;


    });

    router.post('/suggestedAccountsToProject', function(req, res, next){
        var criteria = {};
        criteria.location = req.body.project.address.country;
        criteria.resources = req.body.project.resources;
        criteria.connections = req.body.project.collaboration;
        criteria.sectors = req.body.project.sector;

        //var resourcesType = criteria.resources.map(function(x){return x.type});
        var resourcesType = [];
        var sectorsType = [];

        for(i = 0; i < criteria.resources.length; i++){
            resourcesType.push(criteria.resources[i].type);
        }

        for(i = 0; i < criteria.sectors.length; i++){
            sectorsType.push(criteria.sectors[i].type);
        }

        user.find({'country': criteria.location, resources: {$elemMatch: {type: {$in: resourcesType}}}, sectors: {$in: sectorsType}}, function(err, foundUsers){
            if(err){

            }
            if(foundUsers.length < 1){
                return res.send({status: false, message: "No Suggested Accounts"});
            }

            //for(i = 0; i < foundUsers.length; i++){
            //    var score = {};
            //    score.resources = countSimilarCriteria(criteria.resources, foundUsers.resources, false);
            //    score.connections = countSimilarCriteria(criteria.connections, foundUsers.connections, true);
            //    score.sectors = countSimilarCriteria(criteria.sectors, foundUsers.sectors, false);
            //
            //    foundUsers.score = score;
            //}

            console.log('suggested accounts to project: '+JSON.stringify(foundUsers));

            return res.send({status: true, accounts: foundUsers});
        });

        //user.find({'location.address.country': criteria.location, resources: {$elemMatch: {type: {$in: resourcesType}}}, connections: {$in: criteria.connections}, sectors: {$in: criteria.sectors}}, function(err, foundUsers){
        //    if(err){
        //
        //    }
        //    if(foundUsers.length < 1){
        //        return res.send({status: false, message: "No Suggested Accounts"});
        //    }
        //
        //    for(i = 0; i < foundUsers.length; i++){
        //        var score = {};
        //        score.resources = countSimilarCriteria(criteria.resources, foundUsers.resources, false);
        //        score.connections = countSimilarCriteria(criteria.connections, foundUsers.connections, true);
        //        score.sectors = countSimilarCriteria(criteria.sectors, foundUsers.sectors, false);
        //
        //        foundUsers.score = score;
        //    }
        //
        //    return res.send({status: false, accounts: foundUsers});
        //});
    });

    router.get('/searchUser/:name', function(req, res, next){
       var regname =  req.params.name;

       /// .*regname*./

       user.find({orgname: new RegExp(regname)}, function(err, foundUsers){
            if(err){

            }
            if(foundUsers.length < 1){
                return res.send({status: false, message: "No Users Found"});
            }

            return res.send({status: true, accounts: foundUsers});
       });
    });

    router.get('/getDonorDescription/:id', function(req, res, next){
       var id = req.params.id;

       user.findOne({_id: id},'orgname',function(err, foundUser){
           if(err){}
           if(!foundUser){
               return res.send({status: false});
           }

           console.log('donor description: '+JSON.stringify(foundUser));

           return res.send({status: true, account: foundUser});
       })
    });

    router.get('/getAccountById/:id', function(req, res, next){
       var id = req.params.id;

       user.findOne({_id: id}, function(err, foundUser){
           if(err){}
           if(!foundUser){
               return res.send({status: false});
           }

           return res.send({status: true, account: foundUser});
        });
    });

    router.post('/changeAccountSettings', function(req, res, next){
        var account = req.body.account;

        user.findOne({_id: account.id}, function(err, foundUser){
           if(err){}

           if(!isValidPassword(foundUser, account.oldPassword)){
               return res.send({status: false, message: "Old Password is not correct!"});
           }

           foundUser.username = account.username;
           foundUser.email = account.email;
           if(account.newPassword){
               foundUser.password = createHash(account.newPassword);
           }

           foundUser.save(function(err, savedUser){
              if(err){}

              return res.send({status: true, account: savedUser});
           });
        });
    });

    router.get('/senderPicture/:id', function(req, res, next){
        var id = req.params.id;

        user.findOne({_id: id},'picture',function(err, foundUser){
           if(err){}
           if(!foundUser){
               return res.send({status: false});
           }

           return res.send({status: true, picture: foundUser.picture});
        });
    });

    router.get('/listOfFAQs', function(req, res, next){
        faq.find({answered: "true"}, function(err, foundFAQ){
           if(err){
               return res.send({status: false});
           }

           if(foundFAQ.length < 1){
               return res.send({status: false});
           }

           return res.send({status: false, faqs: foundFAQ});
        });
    });

    router.post('/sendFAQ', function(req, res, next){
        var reqFaq = req.body.faq;

        var newFaq = new faq();
        newFaq.email = reqFaq.email;
        newFaq.subject = reqFaq.subject;
        newFaq.question = reqFaq.question;

        newFaq.save(function(err, savedFAQ){
            if(err){
                return res.send({status: false});
            }

            return res.send({status: true, faq: savedFAQ});
        })
    })

    function isValidPassword(user, password){
        return bcrypt.compareSync(password, user.password);
    }

    function countSimilarCriteria(arr, arr2, isConn){
        var count = 0;

        if(isConn) {
            for (i = 0; i < arr.length; i++) {
                if (arr2.indexOf(arr[i]) > -1) {
                    count++;
                }
            }
        }
        else{
            for (i = 0; i < arr.length; i++) {
                for(j = 0; j < arr2.length; j++) {
                    if (arr[i].type == arr2[j].type) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    return router;
};
