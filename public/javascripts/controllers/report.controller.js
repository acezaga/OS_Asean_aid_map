/**
 * Created by Asus on 1/4/2017.
 */
angular.module('sbAdminApp').controller('createProjectSummaryController', function($scope, $rootScope, $http, $location, projectService, accountService, Authentication, toaster, $timeout){
    Authentication.authentication();

    $scope.summaryReport = {};

    $scope.availResourcesList = [];
    $scope.availResoucesDescList = {};

    $scope.activitySet = {
        activityResources: []
    };

    projectService.getProject($location.search().name).then(function(response){
        $scope.project = response.data.project;

        getResources($scope);

        projectService.getProjectSummary($scope.project._id).then(function(response){
            if(response.data.status){
                $scope.summaryReport = response.data.summary;

                $scope.activitySet.activityResources = $scope.summaryReport.activities;

                $scope.create = false;
            }
            else{
                $scope.summaryReport.project = $scope.project._id;

                $scope.create = true;
            }

            console.log('resources: '+$scope.availResourcesList);
            console.log('activity resources: '+$scope.activitySet.activityResources);
        });
    });

    //function getResources(scope){
    //    //for(i = 0; i < $scope.project.resources.length; i++){
    //    var resources = scope.project.resources;
    //    for(j = 0; j < resources.length; j++){
    //        var index = scope.availResourcesList.indexOf(resources[j].type);
    //
    //        if(index < 0){
    //            scope.availResourcesList.push(resources[j].type);
    //        }
    //
    //        if(resources[j].description){
    //            if(!scope.availResoucesDescList[resources[j].type]) {
    //                scope.availResoucesDescList[resources[j].type] = [];
    //                console.log('check resource key executed');
    //            }
    //            scope.availResoucesDescList[resources[j].type].push(resources[j].description);
    //        }
    //    }
    //    //}
    //}

    $scope.checkIfDescription = function(type){
        switch (type){
            case 'Money':
                return false;
            case 'Human Resource':
                return false;
            default:
                return true;
        }
    }

    $scope.getDescList = function(type){
        console.log('type: '+type);
        return $scope.availResoucesDescList[type];
    }

    $scope.addNewActivity = function (){
        $scope.activitySet.activityResources.push({name: "", resources: []});
        $scope.addNewResourceOnActivity($scope.activitySet.activityResources[$scope.activitySet.activityResources.length - 1]);
    }

    $scope.addNewResourceOnActivity = function (activity){
        activity.resources.push({});
    }

    $scope.removeActivity = function(index){
        $scope.activitySet.activityResources.splice(index, 1);
    }

    $scope.getOnhand = function(resourceType, resourceDescription){
        var resourceUsage = 0;
        $scope.activitySet.activityResources.forEach(function(activity){
            var index = activity.resources.findIndex(function(resource){
                return resource.type == resourceType && resource.description == resourceDescription;
            });

            if(index > -1){
                //console.log('resource type and desc: '+activity.resources[index].type+ " "+activity.resources[index].description);
                //console.log('executed true to check for usage: '+activity.resources[index].qty);
                resourceUsage = parseInt(resourceUsage) + parseInt(activity.resources[index].qty ? activity.resources[index].qty : 0);
            }
        });

        var projectResIndex = $scope.project.resources.findIndex(function(resource){
            return resource.type == resourceType && resource.description == resourceDescription;
        });

        //console.log('check for avail index: '+projectResIndex);
        //console.log('check for usage: '+resourceUsage);
        //
        //console.log('avail inhand: '+$scope.project.resources[projectResIndex].inhand);

        var result = parseInt($scope.project.resources[projectResIndex].inhand) - parseInt(resourceUsage);
        //if(projectResIndex > -1){
        //console.log('check for available resource: '+result);
        return result;
        //}
    }

    $scope.saveChanges = function(){
        // value of fields to be entered in the summary report activities
        $scope.summaryReport.activities = $scope.activitySet.activityResources;

        //console.log('activity 0: '+JSON.stringify($scope.summaryReport.activities[0]));

        projectService.saveSummaryReport($scope.summaryReport).then(function(response){
            if(response.data.status){
                toaster.pop('success', 'Creation Successful!', 'Successfully created the Project Summary.')
                $timeout(function(){
                    $location.url('/dashboard/projectsummary?name='+$scope.project.title);
                }, 2000)
            }
        });
    }

    $scope.cancelChanges = function(){
        $location.url('/dashboard/projprofile?name='+$scope.project.title)
    }
});

angular.module('sbAdminApp').controller('projectSummaryController', function($scope, $rootScope, $http, $location, projectService, accountService, Authentication){
    Authentication.authentication();

    $scope.project = {};
    $scope.summaryReport = {};
    $scope.projectDonors = [];

    $scope.availResourcesList = [];
    $scope.availResoucesDescList = {};

    $scope.activitySet = {
        activityResources: []
    };

    projectService.getProject($location.search().name).then(function(response){
        $scope.project = response.data.project;

        projectService.getCreator($scope.project.creator).then(function(response){
            $scope.project.creator = response.data;
        });

        getResources($scope);

        projectService.getProjectSummary($scope.project._id).then(function(response){
            if(response.data.status){
                $scope.summaryReport = response.data.summary;

                $scope.activitySet.activityResources = $scope.summaryReport.activities;
            }
            else{
                // Display no project summary created
            }
        });

        projectService.getProjectDonors($scope.project._id).then(function(response){
            if(response.data.status){
                $scope.projectDonors = response.data.donors;

                $scope.projectDonors.forEach(function(donor){
                    accountService.getDonorDescription(donor.from).then(function(response){
                        console.log('donor desc: '+JSON.stringify(response.data.account));
                        donor.from = response.data.account;
                    });
                });
            }
        });

        console.log('donors: '+JSON.stringify($scope.projectDonors));
    });

    $scope.editProjectSummary = function(){
        $location.url('/dashboard/createprojsummary?name='+$scope.project.title);
    }

    $scope.printSummaryReport = function(){
        // method for printing the report
        var donorPdfBody = [];
        donorPdfBody.push([ 'Donor Name', 'Resources', 'Quantity' ]);
        for(i = 0; i < $scope.projectDonors.length; i++){
            var donor = $scope.projectDonors[i];
            for(j = 0; j < donor.resources.length; j++){
                var resource = donor.resources[j];
                var data = [donor.from.orgname, resource.type+"("+resource.description+")", resource.donated];
                donorPdfBody.push(data);
            }
        }

        var pdfBody = [];
        pdfBody.push([ 'Activity Name', 'Resources', 'Quantity' ]);
        for(i = 0; i < $scope.summaryReport.activities.length; i++){
            var activity = $scope.summaryReport.activities[i];
            for(j = 0; j < activity.resources.length; j++){
                var resource = activity.resources[j];
                var data = [activity.name, resource.type+"("+resource.description+")", resource.qty];
                pdfBody.push(data);
            }
        }

        console.log('pdf body content: '+JSON.stringify(pdfBody));

        var d = new Date();

        var docDefinition = {
            footer:  function(currentPage, pageCount) {
                return [
                    { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, style:'footerPage'},
                    { text: ''},
                    { text: 'Report Time and Date: '+d.getMonth()+" - "+d.getDate()+" - "+d.getFullYear(), style: 'fPage'},
                    { text: ''}
                ];
            },
            content: [
                { text: $scope.project.creator.orgname, style: 'org'},
                { text: $scope.project.creator.address+","+$scope.project.creator.country, style: 'orgDetails'},
                { text: $scope.project.creator.contacts.telNo, style: 'orgDetails'},
                { text: $scope.project.creator.contacts.email, style: 'orgDetails'},
                { text: $scope.project.creator.contacts.website, style: 'orgDetails'},
                { text: $scope.project.title, style: 'projName'},
                { text: 'Project Summary', style: 'reportTitle' },
                { text: '', style: 'reportTitle'},
                { text: 'List of Donors'},
                {
                    style: 'tableExample',
                    layout: 'lightHorizontalLines', // optional
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: [ '*', '*', '*' ],

                        body: donorPdfBody
                    }
                },
                { text: 'List of Activities'},
                {
                    style: 'tableExample',
                    layout: 'lightHorizontalLines', // optional
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: [ '*', '*', '*' ],

                        body: pdfBody
                    }, layout: {
                    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null; }
                }
                },
                { text: '_________________________________________', style: 'authorizedbyline' },
                { text: 'Authorized by            Date', style: 'authorizedby' }

            ],
            styles: {
                reportTitle: {
                    fontSize: 17,
                    bold: true,
                    alignment: 'center',
                    color: '#337ab7',
                    margin: [0, 0, 0, 10]
                },
                projName: {
                    fontSize: 18,
                    italics: true,
                    alignment: 'left'
                },
                org: {
                    fontSize: 20,
                    italics: true,
                    alignment: 'left'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                orgDetails: {
                    fontSize: 10,
                    alignment: 'left'
                },
                footerPage: {
                    fontSize: 10,
                    alignment: 'right',
                    margin: [0, 0, 30, 0]
                },
                fPage: {
                    fontSize: 10,
                    margin: [30]
                },
                authorizedbyline: {
                    alignment: 'right',
                    italics: true,
                    margin: [10, 0, 0, 0]
                },
                authorizedby: {
                    alignment: 'right',
                    italics: true,
                }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    }

});

angular.module('sbAdminApp').controller('allSummaryReport', function($scope, $rootScope, $http, $location, projectService, accountService, Authentication){
    Authentication.authentication();

    $scope.summaries = [];
    $scope.year = 2017;

    projectService.getAllProjectSummaryByYear($rootScope.account._id, $scope.year).then(function(response){
        if(response.data.status){
            $scope.summaries = response.data.summary;

            //for(i = 0; i < $scope.summaries.length; i++){
            //    projectService.getProjectByIdSummary($scope.summaries[i].project).then(function(response){
            //        if(response.data.status){
            //            $scope.summaries[i].project = response.data.project;
            //        }
            //    });
            //}

            $scope.summaries.forEach(function(summary){
                projectService.getProjectByIdSummary(summary.project).then(function(response){
                    if(response.data.status){
                        summary.project = response.data.project;
                    }
                });
            });
        }
    });

    $scope.seeSummary = function(index){
        $location.url('/dashboard/projectsummary?name='+$scope.summaries[index].project.title);
    }

    $scope.printSummaryReport = function(){
        var pdfBody = [];
        pdfBody.push([ 'Project Name', 'Start Date', 'End Date', 'Status' ]);
        for(i = 0; i < $scope.summaries.length; i++){
            var data = [$scope.summaries[i].project.title, $scope.summaries[i].project.startDate.substring(0, 10), $scope.summaries[i].project.endDate.substring(0, 10), $scope.summaries[i].project.status];
            pdfBody.push(data);
        }

        console.log('pdf body content: '+JSON.stringify(pdfBody));

        var d = new Date();

        var docDefinition = {
            footer:  function(currentPage, pageCount) {
                return [
                    { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, style:'footerPage'},
                    { text: ''},
                    { text: 'Report Time and Date: '+d.getMonth()+" - "+d.getDate()+" - "+d.getFullYear(), style: 'fPage'},
                    { text: ''}
                ];
            },
            content: [
                { text: $rootScope.account.orgname, style: 'orgName'},
                { text: $rootScope.account.address+","+$rootScope.account.country, style: 'orgDetails'},
                { text: $rootScope.account.contacts.telNo, style: 'orgDetails'},
                { text: $rootScope.account.contacts.email, style: 'orgDetails'},
                { text: $rootScope.account.contacts.website, style: 'orgDetails'},
                { text: 'Summary Report', style: 'reportTitle' },
                { text: 'For the Year ' + $scope.year, style: 'year' },
                { text: '', style: 'reportTitle'},
                { text: 'List of Projects'},
                {
                    style: 'tableExample',
                    layout: 'lightHorizontalLines', // optional
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: [ '*', '*', '*', '*' ],

                        body: pdfBody
                    }, layout: {
                    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null; }
                }
                },
                { text: '_________________________________________', style: 'authorizedbyline' },
                { text: 'Authorized by            Date', style: 'authorizedby' }
            ],
            styles: {
                reportTitle: {
                    fontSize: 17,
                    bold: true,
                    alignment: 'center',
                    color: '#337ab7',
                    margin: [0, 0, 0, 10]
                },
                orgName: {
                    fontSize: 20,
                    alignment: 'left'
                },
                orgDetails: {
                    fontSize: 10,
                    alignment: 'left'
                },
                year: {
                    fontSize: 14,
                    italics: true,
                    alignment: 'center'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                footerPage: {
                    fontSize: 10,
                    alignment: 'right',
                    margin: [0, 0, 30, 0]
                },
                fPage: {
                    fontSize: 10,
                    margin: [30]
                },
                authorizedbyline: {
                    alignment: 'right',
                    italics: true,
                    margin: [10, 0, 0, 0]
                },
                authorizedby: {
                    alignment: 'right',
                    italics: true,
                }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    }
});

angular.module('sbAdminApp').controller('performanceReport', function($scope, $rootScope, $http, $location, accountService, projectService, Authentication){
    Authentication.authentication();

    $scope.performanceReport = [];
    $scope.year = 2017;

    $scope.getPerformanceStat = function() {
        projectService.getAllPerformanceStat($rootScope.account._id, $scope.year).then(function (response) {
            if (response.data.status) {
                $scope.noPerformanceReport = false;
                var reportByProject = response.data.performanceReport;
                $scope.performanceReport = [];
                //$scope.performanceReport = response.data.performanceReport;
                $scope.overallScore = {};
                var totalScore = 0;

                for(var i in reportByProject){
                    $scope.performanceReport.push(reportByProject[i]);
                }

                //for (i = 0; i < $scope.performanceReport.length; i++) {
                //    projectService.getProjectByIdSummary($scope.performanceReport[i].project).then(function(response){
                //        if(response.data.status){
                //            console.log('project information recieved');
                //            $scope.performanceReport[i].project = response.data.project;
                //        }
                //    });
                //
                //    totalScore += $scope.performanceReport[i].overall.score;
                //}
                $scope.performanceReport.forEach(function(performance){
                    projectService.getProjectByIdSummary(performance.project).then(function(response){
                        if(response.data.status){
                            console.log('project information recieved');
                            performance.project = response.data.project;
                        }
                    });
                    totalScore += performance.overall.score;
                });

                $scope.overallScore.score = totalScore;
                $scope.overallScore.evaluation = evaluatePerformance(totalScore);
            }
            else {
                console.log('Performance Report becomes null');
                $scope.performanceReport = [];
                $scope.noPerformanceReport = true;
                $scope.overallScore.evaluation = "NONE";
            }
        });
    };

    $scope.seeEvaluation = function(index){
        $scope.currentPerformanceReport = $scope.performanceReport[index];

        console.log('Current Performance: '+JSON.stringify($scope.currentPerformanceReport));

        var highestKey = Object.keys($scope.currentPerformanceReport.evaluation).reduce(function(a, b){ return $scope.currentPerformanceReport.evaluation[a] > $scope.currentPerformanceReport.evaluation[b] ? a : b });
        var lowestKey = Object.keys($scope.currentPerformanceReport.evaluation).reduce(function(a, b){ return $scope.currentPerformanceReport.evaluation[a] < $scope.currentPerformanceReport.evaluation[b] ? a : b });

        console.log('highest key: '+highestKey);
        console.log('lowest key: '+lowestKey);

        $scope.highestPerformanceScore = $scope.currentPerformanceReport.evaluation[highestKey];
        $scope.lowestPerformanceScore = $scope.currentPerformanceReport.evaluation[lowestKey];

        $scope.highestPerformanceDetails = getKeyDetails(highestKey);
        $scope.lowestPerformanceDetails = getKeyDetails(lowestKey);
    };

    function evaluatePerformance (totalScore){
        if(totalScore <= 20){
            return "Poor";
        }
        else if(totalScore <= 40){
            return "Average";
        }
        else if(totalScore <= 60){
            return "Good";
        }
        else if(totalScore <= 80){
            return "Very Good";
        }
        else{
            return "Excellent";
        }
    }

    function getKeyDetails(key){
        var details = "";
        switch (key){
            case 'Rmedia':
                return "Relevance of media provided to the project.";
            case 'Qmedia':
                return "Quantity of media provided (photos, videos, etc.).";
            case 'time':
                return "Time allotment for the project scope.";
            case 'utilization':
                return "Utilization of resources (allocation of resources).";
            case 'display':
                return "Display of resources utilization to the summary of project.";
            case 'purpose':
                return "Purpose or advocacy of the project.";
            case 'appeal':
                return "Appeal to potential collaborators and donors.";
            case 'effort':
                return "Effort exerted of the head organization to the project.";
        }
        return details;
    }
});

angular.module('sbAdminApp').controller('createPerformanceReport', function($scope, $rootScope, $http, $location, projectService, accountService, toaster, $timeout, $state, Authentication){
    Authentication.authentication();

    $scope.performanceReport = {};
    $scope.performanceReport.evaluation = {
        effort: Number,
        appeal: Number,
        purpose: Number,
        display: Number,
        utilization: Number,
        time: Number,
        Qmedia: Number,
        Rmedia: Number
    };

    projectService.getProject($location.search().name).then(function(response){
        $scope.project = response.data.project;

        //for(i = 0; i < $scope.project.length; i++){
        projectService.getCreator($scope.project.creator).then(function(response){
            delete response.data.password;
            $scope.project.creator = response.data;
        });
        //}

        $scope.performanceReport.project = $scope.project._id;
        $scope.performanceReport.evaluator = $rootScope.account._id;
    });

    $scope.submitReport = function(){
        projectService.submitPerformanceReport($scope.performanceReport).then(function(response){
            if(response.data.status){
                toaster.pop('success', "Report submitted!", "Survey was successfully submitted");
                $timeout(function(){
                    $state.go('dashboard.home');
                }, 2000);
            }
        });
    }
});

angular.module('sbAdminApp').controller('statisticalReport', function($scope, $rootScope, Authentication, accountService, projectService){
    Authentication.authentication();

    $scope.choice = "";
    $scope.year = 2017;

    $scope.labels = ['Cancelled', 'Completed', 'Ongoing', 'On-hold'];
    /*series: ['Series A', 'Series B'],*/
    $scope.colours = ["#d9534f", "#5bc0de", "#5cb85c", "#f0ad4e"];

    $scope.getStatOfProject = function(){
        console.log('get stat executed');
        projectService.getStatOfProject($rootScope.account._id, $scope.year, $scope.choice).then(function(response){
            if(response.data.status){
                var projectCount = response.data.projectCount;
                $scope.data = [projectCount.cancelled, projectCount.completed, projectCount.ongoing, projectCount.onhold];
            }
            else{
                $scope.data = [];
            }
        });
    }

});

angular.module('sbAdminApp').controller('resourceStatistics', function($scope, $rootScope, Authentication, accountService, projectService){
    Authentication.authentication();

    $scope.year = 2017;
    $scope.projects = [];
    $scope.selectedProject = {};

    $scope.projectReport = {};
    $scope.projectBarChartData = {};

    $scope.chartSeries = ["Actual", "Expected"];
    $scope.chartLabel = [];

    $scope.data = [];

    $scope.getResourceStat = function(){
        projectService.getResourceStatistics($scope.selectedProject._id).then(function(response){
            if(response.data.status){
                $scope.projectReport = response.data.project;
                $scope.projectBarChartData = {};
                $scope.chartLabel = [];
                $scope.data = [];

                for(i = 0; i < $scope.projectReport.resources.length; i++){
                    var resource = $scope.projectReport.resources[i];
                    //$scope.projectBarChartData[resource.type] = {};
                    if(resource.description){
                        $scope.projectBarChartData[resource.description] = {};
                        //$scope.projectBarChartData[resource.type][resource.description] = {};
                        $scope.projectBarChartData[resource.description].expected = resource.qty;
                        $scope.projectBarChartData[resource.description].actual = resource.inhand;
                    }
                    else{
                        $scope.projectBarChartData[resource.type] = {};
                        $scope.projectBarChartData[resource.type].expected = resource.qty;
                        $scope.projectBarChartData[resource.type].actual = resource.inhand;
                    }


                    //var currentActual = $scope.projectBarChartData[resource.type].overAllActual ? $scope.projectBarChartData[resource.type].overAllActual : 0;
                    //var currentExpected = $scope.projectBarChartData[resource.type].overAllExpected ? $scope.projectBarChartData[resource.type].overAllExpected : 0;
                    //$scope.projectBarChartData[resource.type].overAllActual = currentActual + resource.inhand;
                    //$scope.projectBarChartData[resource.type].overAllExpected = currentActual + resource.qty;
                }

                var actualResources = [];
                var expectedResources = [];

                for(var i in $scope.projectBarChartData){
                    $scope.chartLabel.push(i);
                    //actualResources.push($scope.projectBarChartData[i].overAllActual);
                    //expectedResources.push($scope.projectBarChartData[i].overAllExpected);
                    actualResources.push($scope.projectBarChartData[i].actual);
                    expectedResources.push($scope.projectBarChartData[i].expected);
                }

                $scope.data.push(actualResources);
                $scope.data.push(expectedResources);
            }
            else{
                $scope.chartLabel = [];
                $scope.data = [];
            }
        });
    }

    $scope.filterProjects = function(){
        projectService.getProjectByYear($rootScope.account._id, $scope.year).then(function(response){
            if(response.data.status){
                $scope.projects = response.data.projects;
            }
            else{
                $scope.projects = [];
                $scope.chartLabel = [];
                $scope.data = [];
            }
        });
    }

    //$scope.optionsChart = {
    //    tooltip: function(label){
    //        return "Just some text over here";
    //    },
    //    multiTooltipTemplate: function(label){
    //        console.log(label);
    //        //if(Object.keys($scope.projectBarChartData[value.label]).length > 0){
    //        //    var breakdown = "";
    //        //    if(value.series == 'Expected') {
    //        //    for (var i in $scope.projectBarChartData[label.label]) {
    //        //        breakdown = breakdown + i + ": " + $scope.projectBarChartData[label.label][i].expected + "\n";
    //        //    }
    //        //    }
    //        //    else{
    //        //        for (var i in $scope.projectBarChartData[value.label]) {
    //        //            breakdown = breakdown + i + ": " + $scope.projectBarChartData[label.label][i].actual + "\n";
    //        //        }
    //        //    }
    //        //}
    //        return "Just some text over here";
    //    }
    //}
});

angular.module('sbAdminApp').controller('sectorFrequencyController', function($scope, $rootScope, Authentication, accountService, projectService){
    Authentication.authentication();

    $scope.labels = [];
    $scope.data = [];

    $scope.year = 2017;
    $scope.sectors = [];
    $scope.reqSector = [];
    $scope.chosenSector = "";

    $scope.getSectorByYear = function(){
        projectService.getSectorByYear($scope.year, $rootScope.account._id).then(function(response){
            if(response.data.status){
                $scope.reqSector = response.data.sectors;

                for(i = 0; i < $scope.reqSector.length; i++){
                    var sectors = $scope.reqSector[i].sector;
                    for(j = 0; j < sectors.length; j++){
                        var sector = sectors[j];
                        if($scope.sectors.indexOf(sector.type) < 0){
                            $scope.sectors.push(sector.type);
                        }
                    }
                }
            }
            else{
                $scope.reqSector = [];
                $scope.sectors = [];
                $scope.computeSubSecFrequency();
            }
        })
    };

    $scope.computeSubSecFrequency = function(){
        $scope.labels = [];
        $scope.data = [];

        var chosenSector = $scope.chosenSector;
        var SubSecFrequency = {};
        for(i = 0; i < $scope.reqSector.length; i++){
            var sectors = $scope.reqSector[i].sector;
            for(j = 0; j < sectors.length; j++) {
                var sector = sectors[j];
                if (sector.type == chosenSector) {
                    if (SubSecFrequency.hasOwnProperty(sector.subsector)) {
                        SubSecFrequency[sector.subsector].count += 1;
                    }
                    else {
                        SubSecFrequency[sector.subsector] = {};
                        SubSecFrequency[sector.subsector].count = 1;
                    }
                }
            }
        }

        for(var i in SubSecFrequency){
            $scope.labels.push(i);
            $scope.data.push(SubSecFrequency[i].count);
        }
    }
});

function getResources(scope){
    //for(i = 0; i < $scope.project.resources.length; i++){
    var resources = scope.project.resources;
    for(j = 0; j < resources.length; j++){
        var index = scope.availResourcesList.indexOf(resources[j].type);

        if(index < 0){
            scope.availResourcesList.push(resources[j].type);
        }

        if(resources[j].description){
            if(!scope.availResoucesDescList[resources[j].type]) {
                scope.availResoucesDescList[resources[j].type] = [];
                console.log('check resource key executed');
            }
            scope.availResoucesDescList[resources[j].type].push(resources[j].description);
        }
    }
    //}
}