/**
 * Created by Asus on 11/1/2016.
 */

angular.module('sbAdminApp').controller('homeController', function($scope, $q, $rootScope, $state, accountService, projectService, Authentication, $location, NgMap, socketService, fieldService){
    Authentication.authentication();

    $scope.currentStatistic = {};

    $scope.asyncSelected = undefined;
    $scope.loadingLocations = undefined;
    $scope.noResults = undefined;
    $scope.searchChoice = 'Project';

    $scope.searchedProjects = [];

    $scope.projects = [];
    $scope.projectLocations = [];

    $scope.suggestedProjects = [];
    $scope.suggestedAccounts = [];

    $scope.countryPick = false;
    $scope.sectorPick = false;
    $scope.resourcesPick = false;

    $scope.countries = fieldService.countryTypes;
    $scope.sectors = fieldService.sectorTypes;
    $scope.resources = fieldService.resourcesTypes;

    $scope.countryCriteria = "";
    $scope.sectorCriteria = "";
    $scope.resourcesCriteria = "";

    var geocoder = new google.maps.Geocoder();

    //$scope.creatorRequest = [];

    //$scope.dynMarkers = [];
    //console.log('account: '+JSON.stringify($rootScope.account));
   //$scope.sector = [];

    $scope.health = {name: "Health and Nutrition", size: 0, subsectors: []};
    $scope.poverty = {name: "Poverty Eradication", size: 0, subsectors: []};
    $scope.rural = {name: "Rural Development", size: 0, subsectors: []};
    $scope.education = {name: "Education", size: 0, subsectors: []};
    $scope.environment = {name: "Environment", size: 0, subsectors: []};
    // create object of other sectors

    projectService.getAllProjects().then(function(response){
        $scope.overallProjects = response.data;
        $scope.projects = $scope.overallProjects;

        getCreatorForProject($scope.projects);

        getProjectCountAndSector($scope.projects);

        if($rootScope.authentication && $scope.checkIfProfileComplete()) {
            joinGroups($scope.projects);

            projectService.getSuggestedProjects($rootScope.account).then(function (response) {
                if(response.data.status) {
                    $scope.suggestedProjects = response.data.projects;
                    getCreatorForProject($scope.suggestedProjects);
                    console.log('Suggested Projects: '+JSON.stringify($scope.suggestedProjects));
                }
            });

            //accountService.getSuggestedAccounts($rootScope.account).then(function(response){
            //    if(data.response.status) {
            //        $scope.suggestedAccounts = response.data.accounts;
            //    }
            //});
        }

        //NgMap.getMap().then(function(map) {
        //    var geocoder = new google.maps.Geocoder();
        //
        //    for (var i=0; i<$scope.projects.length; i++) {
        //        var project = $scope.projects[i];
        //        var latLng;
        //        geocoder.geocode({'address':project.address.city}, function(result, status){
        //            if (status == google.maps.GeocoderStatus.OK) {
        //                console.log('fetch latlng successful');
        //                console.log(result[0].geometry.location.lat() +','+ result[0].geometry.location.lng())
        //                latLng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        //                $scope.dynMarkers.push(new google.maps.Marker({position:latLng}));
        //            }
        //        });
        //    }
        //
        //    $scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {});
        //});

        //$scope.$watch('currentPage + numPerPage', manualRebootOfPagedProjects());

        $scope.$watch('currentPage + numPerPage', function() {
            console.log('triggered watch');

            var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                , end = begin + $scope.numPerPage;

            console.log('begin: '+begin);
            console.log('end: '+end);

            $scope.pagedProjects = $scope.projects.slice(begin, end);
        });

    }, function(err){
        $scope.status = err.statusText;
    });

    $scope.checkIfProfileComplete = function(){
        if(!$rootScope.account){
            return false;
        }

        if($rootScope.account.country) {
            if ($rootScope.account.sectors.length > 0) {
                if ($rootScope.account.resources.length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    function getCreatorForProject(projects){
        //$scope.creatorRequest = [];

        projects.forEach(function(project, index, array){
            //var deferred = $q.defer();
            //$scope.creatorRequest.push(deferred.promise);
            projectService.getCreator(project.creator).then(function(response){
                delete response.data.password;
                project.creator = response.data;
                //console.log('defered: '+response.data.orgname);
                //deferred.resolve();
            });
        });
    }

    function getProjectCountAndSector(projects){
        projects.forEach(function(project){
            //console.log('Executed for Each');
            //var index = $scope.projectLocations.indexOf({location: project.address.city});
            //var index = $scope.projectLocations.findIndex(function(element, index, array){
            //    console.log('element: '+element.location);
            //    console.log('project address: '+project.address.city);
            //    element.location.toString() == project.address.city.toString();
            //});
            //console.log('index: '+index);
            if($scope.projectLocations.length == 0){
                $scope.projectLocations.push({location: project.address.city, count: 1});
            }
            else {
                var found = false;
                for (i = 0; i < $scope.projectLocations.length; i++) {
                    //console.log('location '+i+' : '+$scope.projectLocations[i].location+' '+project.address.city);
                    if ($scope.projectLocations[i].location == project.address.city) {
                        $scope.projectLocations[i].count += 1;
                        found = true;
                        break;
                    }
                }

                if(!found){
                    $scope.projectLocations.push({location: project.address.city, count: 1});
                }
            }
            //console.log('position: '+project.address.city);
            console.log('sector of project: '+JSON.stringify(project.sector));

            project.sector.forEach(function(sector){
                switch (sector.type) {
                    case "Health and Nutrition":
                        $scope.health.size += 1;
                        if($scope.health.subsectors.length == 0){
                            $scope.health.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.health.subsectors.length; i++){
                                if($scope.health.subsectors[i].name == sector.subsector){
                                    $scope.health.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.health.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        //var index = $scope.health.subsectors.indexOf(sector.subsector);
                        //if(index > -1){
                        //    $scope.health.subsectors[index].count += 1;
                        //}
                        //else{
                        //    $scope.health.subsectors.push({name: sector.subsector, count: 1});
                        //}
                        break;
                    //case other sectors
                    case "Poverty Eradication":
                        $scope.poverty.size += 1;
                        if($scope.poverty.subsectors.length == 0){
                            $scope.poverty.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.poverty.subsectors.length; i++){
                                if($scope.poverty.subsectors[i].name == sector.subsector){
                                    $scope.poverty.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.poverty.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Rural Development":
                        $scope.rural.size += 1;
                        if($scope.rural.subsectors.length == 0){
                            $scope.rural.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.rural.subsectors.length; i++){
                                if($scope.rural.subsectors[i].name == sector.subsector){
                                    $scope.rural.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.rural.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Education":
                        $scope.education.size += 1;
                        if($scope.education.subsectors.length == 0){
                            $scope.education.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.education.subsectors.length; i++){
                                if($scope.education.subsectors[i].name == sector.subsector){
                                    $scope.education.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.education.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Environment":
                        $scope.environment.size += 1;
                        if($scope.environment.subsectors.length == 0){
                            $scope.environment.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.environment.subsectors.length; i++){
                                if($scope.environment.subsectors[i].name == sector.subsector){
                                    $scope.environment.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.environment.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                }
            });
        });
    }

    function joinGroups(projects){
        for(i = 0; i < projects.length; i++){
            if(projects[i].creator._id == $rootScope.account._id){
                socketService.emit('join-room', projects[i]._id);
            }
            else if(projects[i].collaboration.indexOf($rootScope.account._id) > -1){
                socketService.emit('join-room', projects[i]._id);
            }
        }
    }

    $rootScope.$on('CheckSuggestion', function(event, args){
        projectService.getSuggestedProjects($rootScope.account).then(function (response) {
            if(response.data.status) {
                $scope.suggestedProjects = response.data.projects;
                getCreatorForProject($scope.suggestedProjects);
            }
        });

        //accountService.getSuggestedAccounts($rootScope.account).then(function(response){
        //    if(data.response.status) {
        //        $scope.suggestedAccounts = response.data.accounts;
        //    }
        //});

        joinGroups($scope.projects);
    });

    $scope.filter = function(){
        // filter the projects based on the search or gis
    };

    $scope.getSuggestedProjects = function(){
        var criteria = {location: $scope.countryCriteria, sector: $scope.sectorCriteria, resources: $scope.resourcesCriteria, account: $rootScope.account};
        projectService.getSuggestedProjectsByCriteria(criteria).then(function(response){
               $scope.suggestedProjects = response.data.projects;
               getCreatorForProject($scope.suggestedProjects);
        });
    };

    $scope.getMatchStats = function(index){

    }

    $scope.findProject = function(){
        if($scope.searchChoice == 'Project') {
            projectService.getSearchProject($scope.asyncSelected).then(function (response) {
                if (response.data.status) {
                    console.log('projects by search: ' + JSON.stringify(response.data.projects));
                    $scope.searchedProjects = [];
                    for (i = 0; i < response.data.projects.length; i++) {
                        $scope.searchedProjects.push(response.data.projects[i].title);
                    }

                    //console.log('pushed project: '+JSON.stringify(projects));

                    //return projects;
                }
            });
        }
        else{
            accountService.getSearchUser($scope.asyncSelected).then(function(response){
                if(response.data.status){
                    $scope.searchedProjects = [];
                    $scope.searchedAccounts = response.data.accounts;
                    for (i = 0; i < response.data.accounts.length; i++) {
                        $scope.searchedProjects.push(response.data.accounts[i].orgname);
                    }
                }
            })
        }
    }

    //$scope.getSuggestedProjects = function(){
    //    if($rootScope.authentication){
    //        projectService.getSuggestedProjects($rootScope.account).then(function(response){
    //            $scope.suggestedProjects = response.data.projects;
    //        });
    //    }
    //};
    //
    //$scope.getSuggestedAccounts = function(){
    //    if($rootScope.authentication){
    //        accountService.getSuggestedAccounts($rootScope.account).then(function(response){
    //            $scope.suggestedAccounts = response.data.accounts;
    //        });
    //    }
    //};

    $scope.onClickSuggestedProject = function(project){
        $location.url('/dashboard/projprofile?name='+project.title);
    }

    $scope.onClickSuggestedAccount = function(account){
        $location.url('/dashboard/orgprofile?name='+account.username);
    }

    $scope.onClickProjectName = function(project){
        $rootScope.selectedProject = project;
        $location.url('/dashboard/projprofile?name='+project.title);
        //$state.go('dashboard.projectprofile');
    };

    $scope.onClickOrgName = function(account){
        $rootScope.selectedAccount = account;
        $location.url('/dashboard/orgprofile?name='+account.username);
        //$state.go('dashboard.orgprofile');
    };

    $scope.pagedProjects = []
        ,$scope.currentPage = 1
        ,$scope.numPerPage = 5
        ,$scope.maxSize = 5;

    $('#suggestion-dropdown').click(function(e) {
        e.stopPropagation();
    });
    /*$('#popoverData').popover();*/

    $("[data-toggle=popover]").popover({
        html : true,
        content: function() {
            var content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        },
        title: function() {
            var title = $(this).attr("data-popover-content");
            return $(title).children(".popover-heading").html();
        }
    });


    $('body').popover({ selector: '[data-popover]', trigger: 'hover', placement: 'auto', delay: {show: 50, hide: 50}});

    $scope.checkCollabStats = function(accountId, projectId){
        var account = {};
        var project = {};
        accountService.getAccountById(accountId).then(function(accountResponse){
            if(accountResponse.data.status){
                account = accountResponse.data.account;
            }

            projectService.getProjectById(projectId).then(function(projectResponse){
                if(projectResponse.data.status){
                    project = projectResponse.data.project;
                }

                //$scope.currentStatistic.date = new Date() - new Date(project.startDate);
                $scope.currentStatistic.date = Math.round((new Date() - new Date(project.startDate))/(1000*60*60*24));

                var overallCollab = project.collaboration.length;
                var overAllSectors = project.sector.length;
                var overAllResources = project.resources.length;

                var matchedLocation = 0;
                $scope.matchedConnCollab = 0;
                var matchedSectors = 0;
                //var matchedResources = 0;
                $scope.matchedResources = [];

                $scope.currentStatistic.matchedSector = [];

                if(account.country == project.address.country){
                    matchedLocation = 50;
                }

                for(i = 0; i < account.connections; i++){
                    if(project.collaboration.indexOf(account.connections[i]) > -1){
                        $scope.matchedConnCollab += 1;
                    }
                }

                for(i = 0; i < account.sectors.length; i++){
                    for(j = 0; j < project.sector.length; j++){
                        if(account.sectors[i].type == project.sector[j].type){
                            matchedSectors += 1;
                            $scope.currentStatistic.matchedSector.push(account.sectors[i].type);
                            break;
                        }
                    }
                }

                for(i = 0; i < account.resources.length; i++){
                    for(j = 0; j < project.resources.length; j++){
                        if(account.resources[i].type == project.resources[j].type){
                            if(account.resources[i].description && project.resources[j].description){
                                if(account.resources[i].description == project.resources[j].description){
                                    //matchedResources += 1;
                                    //console.log('matched desc');
                                    $scope.matchedResources.push({type: project.resources[j].type, description: project.resources[j].description, needed: (project.resources[j].qty - project.resources[j].inhand)});
                                }
                            }
                            else{
                                //console.log('matched type');
                                //matchedResources += 1;
                                $scope.matchedResources.push({type: project.resources[j].type, needed: (project.resources[j].qty - project.resources[j].inhand)});
                            }
                        }
                    }
                }

                //if(matchedConnCollab > 0 && overallCollab > 0) {
                //    $scope.currentStatistic.proximity = matchedLocation + (matchedConnCollab / overallCollab * 50);
                //}
                //else{
                //    $scope.currentStatistic.proximity = matchedLocation;
                //}
                //$scope.currentStatistic.sector = matchedSectors / overAllSectors * 100;
                //$scope.currentStatistic.resources = matchedResources / overAllResources * 100;
                //
                //$scope.currentStatistic.overall = ($scope.currentStatistic.proximity + $scope.currentStatistic.sector + $scope.currentStatistic.resources) / 3;
                //
                //console.log('matched Resources: '+matchedResources+"  overall match: "+overAllResources);
            });

        });
    }

    $scope.removeSuggestion = function(index){
        $scope.suggestedProjects.splice(index, 1);
    }

    $scope.refreshSuggestionFilter = function(){
        $scope.countryPick = false;
        $scope.sectorPick = false;
        $scope.resourcesPick = false;
        $scope.countryCriteria = "";
        $scope.sectorCriteria = "";
        $scope.resourcesCriteria = "";
        $scope.suggestedProjects = [];

        $rootScope.$emit('CheckSuggestion', {});
    }

    $scope.executeSearch = function(){
        if($scope.searchChoice == 'Project'){
            $location.url('/dashboard/projprofile?name='+$scope.asyncSelected);
        }
        else{
           for(i = 0; i < $scope.searchedAccounts.length; i++){
               var searchAccount = $scope.searchedAccounts[i];
               if($scope.asyncSelected == searchAccount.orgname){
                   $location.url('/dashboard/orgprofile?name='+searchAccount.username);
                   break;
               }
           }
        }
    }

    $scope.onMarkerClick = function(event){
        geocoder.geocode({'location': event.latLng}, function(results, status){
            if(status == 'OK'){
                console.log('result geocode: '+JSON.stringify(results[0].address_components[1].short_name));
                console.log('result geocode: '+JSON.stringify(results[0].address_components[2].short_name));
                //console.log('result geocode: '+JSON.stringify(results[0]));
                $scope.clickedLocation = [results[0].address_components[1].short_name, results[0].address_components[2].short_name]

                var index = $scope.projectLocations.findIndex(function(project){
                                return project.location == $scope.clickedLocation[0];
                            });

                console.log('index of project: '+index);

                if(index > -1){
                    $scope.clickMarkerLoc = $scope.clickedLocation[0];

                    $scope.projectsByMarker = [];

                    $scope.overallProjects.forEach(function(project){
                       if(project.address.city == $scope.clickedLocation[0]){
                           $scope.projectsByMarker.push(project);
                       }
                    });

                    $scope.projects = $scope.projectsByMarker;
                    getSectorCountOnly($scope.projects);
                    //getCreatorForProject($scope.projects);
                    //$q.all($scope.creatorRequest).then(function(){
                    //console.log('all promises were done');
                    $scope.currentPage = 1;
                    manualRebootOfPagedProjects();
                    //});

                    console.log('paged projects: '+JSON.stringify($scope.projectsByMarker));
                }
                else{
                    var stateIndex = $scope.projectLocations.findIndex(function(project){
                                        return project.location == $scope.clickedLocation[1];
                                    });

                    if(stateIndex > -1) {
                        $scope.clickMarkerLoc = $scope.clickedLocation[1];

                        $scope.projectsByMarker = [];

                        $scope.overallProjects.forEach(function (project) {
                            if (project.address.city == $scope.clickedLocation[1]) {
                                $scope.projectsByMarker.push(project);
                            }
                        });

                        $scope.projects = $scope.projectsByMarker;
                        getSectorCountOnly($scope.projects);
                        //getCreatorForProject($scope.projects);
                        //$q.all($scope.creatorRequest).then(function(){
                        $scope.currentPage = 1;
                        manualRebootOfPagedProjects();
                        //});
                    }
                }
            }
        });
        //$scope.clickedLocation = JSON.stringify(event);
        //console.log('clicked locaction: '+$scope.clickedLocation);
    }

    function manualRebootOfPagedProjects(){
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
            , end = begin + $scope.numPerPage;

        console.log('begin: '+begin);
        console.log('end: '+end);

        $scope.pagedProjects = $scope.projects.slice(begin, end);
    }

    function getSectorCountOnly(projects){
        $scope.health = {name: "Health and Nutrition", size: 0, subsectors: []};
        $scope.poverty = {name: "Poverty Eradication", size: 0, subsectors: []};
        $scope.rural = {name: "Rural Development", size: 0, subsectors: []};
        $scope.education = {name: "Education", size: 0, subsectors: []};
        $scope.environment = {name: "Environment", size: 0, subsectors: []};

        projects.forEach(function(project){

            project.sector.forEach(function(sector){
                switch (sector.type) {
                    case "Health and Nutrition":
                        $scope.health.size += 1;
                        if($scope.health.subsectors.length == 0){
                            $scope.health.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.health.subsectors.length; i++){
                                if($scope.health.subsectors[i].name == sector.subsector){
                                    $scope.health.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.health.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        //var index = $scope.health.subsectors.indexOf(sector.subsector);
                        //if(index > -1){
                        //    $scope.health.subsectors[index].count += 1;
                        //}
                        //else{
                        //    $scope.health.subsectors.push({name: sector.subsector, count: 1});
                        //}
                        break;
                    //case other sectors
                    case "Poverty Eradication":
                        $scope.poverty.size += 1;
                        if($scope.poverty.subsectors.length == 0){
                            $scope.poverty.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.poverty.subsectors.length; i++){
                                if($scope.poverty.subsectors[i].name == sector.subsector){
                                    $scope.poverty.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.poverty.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Rural Development":
                        $scope.rural.size += 1;
                        if($scope.rural.subsectors.length == 0){
                            $scope.rural.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.rural.subsectors.length; i++){
                                if($scope.rural.subsectors[i].name == sector.subsector){
                                    $scope.rural.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.rural.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Education":
                        $scope.education.size += 1;
                        if($scope.education.subsectors.length == 0){
                            $scope.education.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.education.subsectors.length; i++){
                                if($scope.education.subsectors[i].name == sector.subsector){
                                    $scope.education.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.education.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                    case "Environment":
                        $scope.environment.size += 1;
                        if($scope.environment.subsectors.length == 0){
                            $scope.environment.subsectors.push({name: sector.subsector, count: 1});
                        }
                        else{
                            var found = false;
                            for(i = 0; i < $scope.environment.subsectors.length; i++){
                                if($scope.environment.subsectors[i].name == sector.subsector){
                                    $scope.environment.subsectors[i].count += 1;
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                $scope.environment.subsectors.push({name: sector.subsector, count: 1});
                            }
                        }
                        break;
                }
            });
        });
    }

    //$scope.htmlPopover = '<label ng-init="checkCollabStats(account._id, project._id)">Resources</label><div><progressbar value="dynamic" type="info"><b>{{currentStatistic.resources}}%</b></progressbar></div><label>Proximity</label><div><progressbar value="dynamic" type="info"><b>{{currentStatistic.proximity}}%</b></progressbar></div><label>Sector Focus</label><div><progressbar value="dynamic" type="info"><b>{{currentStatistic.resources}}%</b></progressbar></div><p class="help-block">Matched sectors: <button class="btn btn-link">match 1 </button> </p><div><label>Time Frame: </label><span>Project started a month ago</span></div><span>Over-all Match</span><div><b>{{dynamic}}%</b></div>';
});