/**
 * Created by Asus on 10/25/2016.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var project = mongoose.model('Projects');
var notification = mongoose.model('Notifications');
var summary = mongoose.model('Summary');
var donation = mongoose.model('Donations');
var performance = mongoose.model('Performance');
var user = mongoose.model('accounts');

router.post('/create', function(req,res,next){

    project.findOne({
        'title': req.body.title
    }, function (err, foundProject) {
        if (err) {
            return res.send(err);
        }
        if (foundProject) {
            return res.send(false);
        }
        else {
            var newProject = new project();
            newProject.title = req.body.title;
            newProject.creator = req.body.creator;
            newProject.address = req.body.address;
            newProject.startDate = req.body.startDate;
            newProject.endDate = req.body.endDate;
            newProject.budget = req.body.budget;
            newProject.sector = req.body.sector;
            newProject.description = req.body.description;
            newProject.contacts = req.body.contacts;
            newProject.resources = req.body.resources;
            //newProject.status = req.body.status;
            newProject.media = req.body.media;
            newProject.picture = req.body.picture;

            console.log('picture: '+req.body.picture);

            newProject.save(function(err, newProject){
                if(err){
                    return res.send(err);
                }
                return res.send(newProject);
            });
        }
    });

});

router.put('/update', function(req, res, next){
    var updateDetails = req.body.project;

    project.findOne({_id: updateDetails._id}, function(err, foundProject){
        if(err){
            return res.send({status: false, message: err});
        }
        if(!foundProject){
            return res.send({status: false, message: "Project not found"});
        }

        foundProject.title = updateDetails.title;
        foundProject.creator = updateDetails.creator;
        foundProject.address = updateDetails.address;
        //foundProject.startDate = updateDetails.startDate;
        foundProject.endDate = updateDetails.endDate;
        foundProject.budget = updateDetails.budget;
        foundProject.sector = updateDetails.sector;
        foundProject.description = updateDetails.description;
        foundProject.contacts = updateDetails.contacts;
        foundProject.resources = updateDetails.resources;
        foundProject.status = updateDetails.status;
        foundProject.media = updateDetails.media;
        foundProject.picture = updateDetails.picture;

        console.log('picture: '+updateDetails.picture);

        foundProject.save(function(err, updatedProject){
            if(err){
                return res.send(err);
            }

            return res.send({status: true, project: updatedProject});
        });
    });
});

router.get('/specificProject/:title', function(req,res,next){
    project.findOne({title: req.params.title}, function(err, foundProject){
        if(err){
            return res.send({status: false, error: err});
        }
        if(!foundProject){
            return res.send({status: false});
        }

        return res.send({status: true, project: foundProject});
    });
});

router.get('/projectByIdforSummary/:id', function(req, res, next){
   var id = req.params.id;

   project.findOne({_id: id}, '_id title startDate endDate status', function(err, foundProject){
        if(err){}
        if(!foundProject){
            return res.send({status: false})
        }

        console.log('project information: '+JSON.stringify(foundProject));

        return res.send({status: true, project: foundProject});
   });
});

router.get('/allUserProjects/:id', function(req,res,next){
    project.find({creator: req.params.id}, function(err, projects){
        if(err){
            return res.send(err);
        }
        return res.send(projects);
    });
});

router.get('/allProjects', function(req,res,next){
    project.find({$or: [{status: 'Ongoing'}, {status: 'On-hold'}]},function(err, projects){
       if(err){
           return res.send(err);
       }
        return res.send(projects);
    });
});

router.post('/collabCheck', function(req, res, next){
    project.find({_id: data.id}, ['collaboration'], function(err, foundProject){
        var index = foundProject.collaboration.indexOf(data.account);

        if(index > 0){
            return res.send(true);
        }
        else{
            return res.send(false);
        }
    });
});

router.post('/singleCollabReqCheck', function(req, res, next){
    notification.find({'from.id': req.body.fromId, 'to.id': req.body.toId, 'to.project.id': req.body.projectId, type: 'ApplyCollaboration', answered: "false", cancelled: "false"}, function(err, foundNotification){
        if(err){
            return res.send({status: false});
        }
        if(foundNotification.length == 0){
            console.log('request length: '+foundNotification.length);
            return res.send({status: false});
        }
        //else {
        //    console.log('return true: '+ foundNotification);
            return res.send({status:true});
        //}
        //return res.send({status: true, notifications: foundNotification});
    });
});

router.post('/collabReqCheck', function(req, res, next){
    notification.find({'to.id': req.body.toId, 'to.project.id': req.body.projectId, type: 'ApplyCollaboration', answered: "false", cancelled: "false"}, function(err, foundNotification){
        if(err){
            return res.send({status: false});
        }
        if(foundNotification.length == 0){
            console.log('request length: '+foundNotification.length);
            return res.send({status: false});
        }
        //else {
        //    console.log('return true: '+ foundNotification);
        //    return res.send({status:true});
        //}
        return res.send({status: true, notifications: foundNotification});
    });
});

router.post('/suggestedProjects', function(req, res, next){
    // get suggested projects based from the criteria
    var criteria = {};
    criteria.location = req.body.account.country;
    criteria.resources = req.body.account.resources;
    criteria.connections = req.body.account.connections;
    criteria.sectors = req.body.account.sectors;

    var resourcesType = [];
    var sectorsType = [];

    for(i = 0; i < criteria.resources.length; i++){
        resourcesType.push(criteria.resources[i].type);
    }

    for(i = 0; i < criteria.sectors.length; i++){
        sectorsType.push(criteria.sectors[i].type);
    }

    project.find({'address.country': criteria.location, resources: {$elemMatch: {type: {$in: resourcesType}}}, sector: {$elemMatch: {type: {$in: sectorsType}}}, creator: {$ne: req.body.account._id}, collaboration: {$ne: req.body.account._id}}, function(err, foundProjects){
        if(err){

        }
        //if(!foundProjects){
        //
        //}
        if(foundProjects.length < 1){
            console.log('suggested Project: '+JSON.stringify(foundProjects));
            return res.send({status: false, message: "No Suggested Projects"});
        }

        //for(i = 0; i < foundUsers.length; i++){
        //    var score = {};
        //    score.resources = countSimilarCriteria(criteria.resources, foundUsers.resources, false);
        //    score.connections = countSimilarCriteria(criteria.connections, foundUsers.connections, true);
        //    score.sectors = countSimilarCriteria(criteria.sectors, foundUsers.sectors, false);
        //
        //    foundUsers.score = score;
        //}

        console.log('suggested Project: '+JSON.stringify(foundProjects));

        return res.send({status: true, projects: foundProjects});
    });

    //project.find({'location.address.city': criteria.location, resources: {$in: criteria.resources}, connections: {$in: criteria.connections}, sectors: {$in: criteria.sectors}}, function(err, foundProjects){
    //
    //});
});

router.post('/suggestedProjectsByCriteria', function(req, res, next){
    var resourcesType = [];
    var sectorsType = [];
    var criteria = {};

    criteria.location = req.body.location ? req.body.location : req.body.account.country;

    if(req.body.resources){
        resourcesType.push(req.body.resources);
    }
    else{
        criteria.resources = req.body.account.resources;
    }

    if(req.body.sector){
        sectorsType.push(req.body.sector);
    }
    else {
        criteria.sectors = req.body.account.sectors;
    }


    if(criteria.resources) {
        for (i = 0; i < criteria.resources.length; i++) {
            resourcesType.push(criteria.resources[i].type);
        }
    }

    if(criteria.sectors)
    for(i = 0; i < criteria.sectors.length; i++){
        sectorsType.push(criteria.sectors[i].type);
    }

    project.find({'address.country': criteria.location, resources: {$elemMatch: {type: {$in: resourcesType}}}, sector: {$elemMatch: {type: {$in: sectorsType}}}, creator: {$ne: req.body.account._id}, collaboration: {$ne: req.body.account._id}}, function(err, foundProjects){
        if(err){

        }

        if(foundProjects.length < 1){
            console.log('suggested Project: '+JSON.stringify(foundProjects));
            return res.send({status: false, message: "No Suggested Projects"});
        }

        console.log('suggested Project: '+JSON.stringify(foundProjects));

        return res.send({status: true, projects: foundProjects});
    });
});

router.get('/projectSummary/:id', function(req, res, next){
    summary.findOne({project: req.params.id}, function(err, foundSummary){
        if(err){
            return res.send({status: false, message: "No Summary"});
        }
        if(!foundSummary){
            return res.send({status: false, message: "No Summary"});
        }

        return res.send({status: true, summary: foundSummary});
    })
});

router.post('/saveProjectSummary', function(req, res, next){
    var summaryDetails = req.body.summary;
    summary.findOne({project: summaryDetails.project}, function(err, foundSummary){
        if(err){

        }
        if(!foundSummary){
            var newSummary = new summary();
            newSummary.project = summaryDetails.project;
            newSummary.activities = summaryDetails.activities;

            newSummary.save(function(err, savedSummary){
                return res.send({status: false, summary: savedSummary});
            });
        }
        else {
            foundSummary.activities = summaryDetails.activities;
            foundSummary.save(function (err, updatedSummary) {
                return res.send({status: true, summary: updatedSummary});
            });
        }
    });
});

router.get('/donors/:id', function(req, res, next){
    var id = req.params.id;

    donation.find({projectId: id}, function(err, foundDonations){
        if(err){
            // send the error message
        }
        if(foundDonations.length < 1){
            return res.send({status: false, message: "There are no Donors"});
        }
        else{
            return res.send({status: true, donors: foundDonations});
        }
    });
});

router.get('/collaboratedProjects/:id', function(req, res, next){
   var id = req.params.id;

    project.find({$or:[ {creator: id}, {collaboration: id} ], status: "Ongoing"}, function(err, foundProjects){
       if(err){

       }

       if(foundProjects.length < 1){
           return res.send({status: false, message: "No Collaborated/Created Projects"})
       }

       return res.send({status: true, projects: foundProjects});


    });
});

router.post('/savePerformanceReport', function(req, res, next){
    var report = req.body.report;
    performance.findOne({project: report.project, evaluator: report.evaluator}, function(err, foundPerformance){
        if(err){ }
        if(foundPerformance){
            // update the report
        }

        var totalScore = 0;

        var performanceReport = new performance();

        for (var i in report.evaluation){
            if(report.evaluation.hasOwnProperty(i)) {
                totalScore += report.evaluation[i];
            }
            console.log('for loop in object executed');
        }

        performanceReport.project = report.project;
        performanceReport.evaluator = report.evaluator;
        performanceReport.evaluation = report.evaluation;
        performanceReport.overall.score = totalScore;

        if(totalScore <= 20){
            performanceReport.overall.evaluation = "Poor";
        }
        else if(totalScore <= 40){
            performanceReport.overall.evaluation = "Average";
        }
        else if(totalScore <= 60){
            performanceReport.overall.evaluation = "Good";
        }
        else if(totalScore <= 80){
            performanceReport.overall.evaluation = "Very Good";
        }
        else{
            performanceReport.overall.evaluation = "Excellent";
        }

        performanceReport.save(function(err, savedReport){
           if(err){ }

           return res.send({status: true, report: savedReport});
        });
    });
});

router.get('/ongoingProjects/:id', function(req, res, next){
    project.find({creator: req.params.id, status: "Ongoing"}, '_id title', function(err, foundProjects){
        if(err){}
        if(foundProjects.length == 0)
        {

        }

        return res.send({status: true, projects: foundProjects})
    });
});

router.get('/portfolio/:id', function(req, res, next){
    project.find({creator: req.params.id, status: "Completed"}, '_id title', function(err, foundProjects){
        if(err){}
        if(foundProjects.length == 0)
        {

        }

        return res.send({status: true, projects: foundProjects});
    });
});

router.get('/allProjectSummary/:id', function(req, res, next){
    var id = req.params.id;
    var projects = [];

    project.find({creator: id, collaboration: id}, '_id', function(err, foundProject){
       if(err){}
       if(foundProject.length < 1){
           return res.send({status: false});
       }

       //projects = foundProject;

        for(i = 0; i < foundProject.length; i++){
            projects.push(foundProject[i]._id);
        }

        summary.find({project: {$in: projects}}, function(err, foundSummary){
            if(err){}
            if(foundSummary.length < 1){
                return res.send({status: false, message: "No Project Summary"});
            }

            return res.send({status: true, summary: foundSummary});
        });
    });
});

router.post('/allProjectSummaryByYear', function(req, res, next){
   var id = req.body.account;
    var yearDate = req.body.year+"-01-01:00:00.000Z";
    var year = new Date(yearDate);
   var projects = [];

   // , starDate: {$gte: year}

   project.find({$or: [{creator: id}, {collaboration: id}]}, '_id', function(err, foundProject){
      if(err){}
      if(foundProject.length < 1){
          return res.send({status: false});
      }

       for(i = 0; i < foundProject.length; i++){
           projects.push(foundProject[i]._id);
       }

       console.log('found projects: '+JSON.stringify(foundProject));

      summary.find({project: {$in: projects}}, function(err, foundSummary){
         if(err){}
         if(foundSummary.length < 1){
             return res.send({status: false});
         }
         console.log('found summary: '+JSON.stringify(foundSummary));
         return res.send({status: true, summary: foundSummary});
      });
   });
});

router.post('/allPerformanceStat/', function(req, res, next){
    var account = req.body.account;
    var yearDate = req.body.year+"-01-01:00:00.000Z";
    var year = new Date(yearDate);

    var performanceByProject = {};

    var projects = [];

    project.find({creator: account, startDate: {$gte: year}}, '_id', function(err, foundProject){
        if(err){}
        if(foundProject.length < 1){
            console.log('No Found Project');
            return res.send({status: false});
        }

        //projects = [];

        for(i = 0; i < foundProject.length; i++){
            projects.push(foundProject[i]._id);
        }

        console.log('projects for perf: '+JSON.stringify(projects));

        performance.find({project: {$in: projects}}, function(err, foundPerformance){
            if(err){}
            if(foundPerformance.length < 1){
                console.log('No Found Project');
                return res.send({status: false, message: "No Performance Report"});
            }

            console.log('found performance surveys: '+JSON.stringify(foundPerformance));

            for(i = 0; i < foundPerformance.length; i++){
                delete foundPerformance[i].evaluator;
                if(performanceByProject[foundPerformance[i].project]) {
                    //performanceByProject[foundPerformance[i].project].evaluation += foundPerformance[i].evaluation;
                    for (var j in performanceByProject[foundPerformance[i].project].evaluation) {
                        performanceByProject[foundPerformance[i].project].evaluation[j] = (performanceByProject[foundPerformance[i].project].evaluation[j] + foundPerformance[i].evaluation[j])/2;
                    }
                }
                else{
                    performanceByProject[foundPerformance[i].project] = foundPerformance[i];
                }
            }

            //return res.send({status: true, performanceReport: foundPerformance});
            return res.send({status: true, performanceReport: performanceByProject});
        });
    });
});

router.post('/getCollaboratorInfo', function(req, res, next){
   var collaborators = req.body.collaborators;

   user.find({_id: {$in: collaborators}}, 'orgname username', function(err, foundUsers){
      if(err){}
      if(foundUsers.length < 1){
          return res.send({status: false});
      }

      console.log('collaborators info: '+JSON.stringify(foundUsers));

      return res.send({status: true, collaborators: foundUsers});
   });
});

router.post('/statisticalProjectReport', function(req, res, next){
    var yearDate = req.body.year+"-01-01:00:00.000Z";
    var year = new Date(yearDate);
    var account = req.body.account;
    var choice = req.body.choice;

    var numberOfProjects = {};
    numberOfProjects.ongoing = 0;
    numberOfProjects.completed = 0;
    numberOfProjects.onhold = 0;
    numberOfProjects.cancelled = 0;

    if(choice == 'owned'){
        console.log('owned projects gathered');
        project.count({creator: account, startDate: {$gte: year}, status: "Ongoing"}, function(err, projectCount){
            numberOfProjects.ongoing = projectCount

            project.count({creator: account, startDate: {$gte: year}, status: "On-hold"}, function(err, projectCount){
                numberOfProjects.onhold = projectCount

                project.count({creator: account, startDate: {$gte: year}, status: "Completed"}, function(err, projectCount){
                    numberOfProjects.completed = projectCount

                    project.count({creator: account, startDate: {$gte: year}, status: "Cancelled"}, function(err, projectCount){
                        numberOfProjects.canclled = projectCount

                        console.log('ongoing: '+numberOfProjects.ongoing);

                        return res.send({status: true, projectCount: numberOfProjects});
                    });
                });
            });
        });
    }
    else{
        console.log('collaborated gathered');
        project.count({collaboration: account, startDate: {$gte: year}, status: "Ongoing"}, function(err, projectCount){
            numberOfProjects.ongoing = projectCount

            project.count({collaboration: account, startDate: {$gte: year}, status: "On-hold"}, function(err, projectCount){
                numberOfProjects.onhold = projectCount

                project.count({collaboration: account, startDate: {$gte: year}, status: "Completed"}, function(err, projectCount){
                    numberOfProjects.completed = projectCount

                    project.count({collaboration: account, startDate: {$gte: year}, status: "Cancelled"}, function(err, projectCount){
                        numberOfProjects.canclled = projectCount

                        return res.send({status: true, projectCount: numberOfProjects});
                    });
                });
            });
        });
    }

});

router.post('/projectsByYear', function(req, res, next){
   var accountId = req.body.account;
   var yearDate = req.body.year+"-01-01:00:00.000Z";
   var year = new Date(yearDate);

    project.find({$or: [{creator: accountId},{collaboration: accountId}], startDate: {$gte: year}}, 'title', function(err, foundProjects){
        if(err){}
        if(foundProjects.length < 1){
            return res.send({status: false});
        }

        return res.send({status: true, projects: foundProjects});
    });
});

router.get('/resourceStatistics/:id', function(req, res, next){
    var projectId = req.params.id;

    project.findOne({_id: projectId}, 'title resources', function(err, foundProject){
       if(err){}

       if(!foundProject){
           return res.send({status: false});
       }

       return res.send({status: true, project: foundProject});
    });
});

router.get('/searchProject/:value', function(req, res, next){
    var keyword = req.params.value;

    project.find({title: new RegExp(keyword)}, function(err, foundProject){
        if(err){}
        if(foundProject.length < 1){
            return res.send({status: false});
        }

        return res.send({status: true, projects: foundProject});
    });
});

router.get('/getProjectById/:id', function(req, res, next){
   var id = req.params.id;

   project.findOne({_id: id}, function(err, foundProject){
      if(err){}
      if(!foundProject){
          return res.send({status: false});
      }

      return res.send({status: true, project: foundProject});
   });
});

router.post('/getSectorsByYear', function(req, res, next){
    var accountId = req.body.account;
    var yearDate = req.body.year+"-01-01:00:00.000Z";
    var year = new Date(yearDate);

    project.find({$or: [{creator: accountId}, {collaboration: accountId}], startDate: {$gte: year}}, 'sector', function(err, foundSectors){
        if(err){}
        if(foundSectors.length < 1){
            return res.send({status: false});
        }

        console.log('sectors req: '+JSON.stringify(foundSectors));
        return res.send({status: true, sectors: foundSectors});
    })
});

router.get('/getCollaboratedProjects/:id', function(req, res, next){
   var accountId = req.params.id;

   project.find({collaboration: accountId}, function(err, foundProjects){
       if(err){
           return res.send({status: false});
       }
       if(foundProjects.length < 1){
           return res.send({status: false});
       }

       return res.send({status: true, projects: foundProjects});
   });
});

router.get('/allOwnedProjects/:id', function(req, res, next){
   var accountId = req.params.id;

   project.find({creator: accountId}, function(err, foundProjects){
       if(err){
           return res.send({status: false});
       }
       if(foundProjects.length < 1){
           return res.send({status: false});
       }

       return res.send({status: true, projects: foundProjects});
   })
});
//router.get('/projectProfile/:name', function(req, res, next){
//    var name = req.params.name;
//
//    project.findOne({title: name}, function(err, foundProject){
//       if(err) {
//           return res.send({status: false, error: err});
//       }
//       if(!foundProject){
//           return res.send({status: false});
//       }
//
//        return res.send({status: true, project: foundProject});
//    });
//});

module.exports = router;