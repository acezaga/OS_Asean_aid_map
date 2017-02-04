    /**
 * Created by Asus on 11/9/2016.
 */
angular.module('sbAdminApp').factory('projectService', function($http){
    var projectObject = {};

    projectObject.createProject = function(projectInfo){
        return $http.post('/project/create', projectInfo);
    }

    projectObject.getAllProjects = function(){
        return $http({
            url: '/project/allProjects',
            method: 'GET'
        });
    }

    projectObject.getUserProjects = function(userId){
        return $http.get('/project/allUserProjects/'+userId);
    }

    projectObject.getProject = function(projectTitle){
        return $http.get('/project/specificProject/'+projectTitle);
    }

    projectObject.getCreator = function(id){
        return $http.get('/user/creator/'+id);
    }

    projectObject.saveChanges = function(project){
        return $http.put('/project/update', {project: project});
    }

    projectObject.checkIfCollabRequested = function(data){
        return $http.post('/project/collabReqCheck', data);
    }

    projectObject.checkIfSingleCollabRequested = function(data){
        return $http.post('/project/singleCollabReqCheck', data);
    }

    projectObject.checkIfCollaborated = function(data){

    }

    projectObject.getSuggestedProjects = function(data){
        return $http.post('/project/suggestedProjects', {account: data});
    }

    projectObject.getSuggestedProjectsByCriteria = function(data){
        return $http.post('/project/suggestedProjectsByCriteria', data);
    }

    projectObject.getProjectSummary = function(data){
        return $http.get('/project/projectSummary/'+data);
    }

    projectObject.saveSummaryReport = function(data){
        return $http.post('/project/saveProjectSummary', {summary: data});
    }

    projectObject.getProjectDonors = function(data){
        return $http.get('/project/donors/'+data);
    }

    projectObject.getCollaboratedProjects = function(data){
        return $http.get('/project/collaboratedProjects/'+data);
    }

    projectObject.submitPerformanceReport = function(data){
        return $http.post('/project/savePerformanceReport', {report: data});
    }

    projectObject.getCollaboratorInfo = function(data){
        return $http.post('/project/getCollaboratorInfo', {collaborators: data});
    }

    projectObject.getOngoingProjects = function(data){
        return $http.get('/project/ongoingProjects/'+data);
    }

    projectObject.getPortfolio = function(data){
        return $http.get('/project/portfolio/'+data);
    }

    projectObject.getAllProjectSummary = function(data){
        return $http.get('/project/allProjectSummary/'+data);
    }

    projectObject.getAllProjectSummaryByYear = function(id, year){
        return $http.post('/project/allProjectSummaryByYear', {account: id, year: year});
    }

    projectObject.getProjectByIdSummary = function(data){
        return $http.get('/project/projectByIdforSummary/'+data);
    }

    projectObject.getAllPerformanceStat = function(id, year){
        return $http.post('/project/allPerformanceStat/', {account: id, year: year});
    }

    projectObject.getStatOfProject = function(id, year, choice){
        return $http.post('/project/statisticalProjectReport', {account: id, year: year, choice: choice});
    }

    projectObject.getProjectByYear = function(id, year){
        return $http.post('/project/projectsByYear', {account: id, year: year});
    }

    projectObject.getResourceStatistics = function(projectId){
        return $http.get('/project/resourceStatistics/'+projectId);
    }

    projectObject.getSearchProject = function(data){
        return $http.get('/project/searchProject/'+data);
    }

    projectObject.getProjectById = function(data){
        return $http.get('/project/getProjectById/'+data);
    }

    projectObject.getSectorByYear = function(year, account){
        return $http.post('/project/getSectorsByYear', {year: year, account: account});
    }

    projectObject.getAllProjectCollaboration = function(data){
        return $http.get('/project/getCollaboratedProjects/'+data);
    }

    projectObject.getAllInitiatedProjects = function(data){
        return $http.get('/project/allOwnedProjects/'+data);
    }

    return projectObject;

});

angular.module('sbAdminApp').factory('GISService', function(){

});