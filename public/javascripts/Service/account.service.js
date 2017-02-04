/**
 * Created by Asus on 11/4/2016.
 */
angular.module('sbAdminApp').factory('accountService', function($http){
    var acctObject = {};

    acctObject.createAccount = function(account){
        return $http.post('/user/register', account);
    }

    acctObject.authenticateAccount = function(account){
        return $http.post('/user/login', account);
    }

    acctObject.getNotification = function(id){
        return $http.get('/user/notifications/'+id);
    }

    acctObject.checkIfRequested = function(data){
        return $http.post('/user/connReqCheck', data);
    }

    acctObject.saveChanges = function(account){
        return $http.put('/user/saveChanges/', {account: account});
    }

    acctObject.getConnectionInfo = function(connection){
        return $http.post('/user/connectionInfo', {connections: connection});
    }

    acctObject.getInvitedCollaborators = function(data){
        return $http.post('/user/invitedCollabCheck', data);
    }

    acctObject.getOrganizationProfile = function(data){
        return $http.get('/user/orgprofile/'+data);
    }

    acctObject.getSuggestedAccounts = function(data){
        return $http.post('/user/suggestedAccounts',{account: data});
    }

    acctObject.getSuggestedAccountsToProject = function(data){
        return $http.post('/user/suggestedAccountsToProject', {project: data});
    }

    acctObject.getDonorDescription = function(data){
        return $http.get('/user/getDonorDescription/'+data);
    }

    acctObject.getSearchUser = function(data){
        return $http.get('/user/searchUser/'+data);
    }

    acctObject.getAccountById = function(data){
        return $http.get('/user/getAccountById/'+data);
    }

    acctObject.changeAccountSettings = function(data){
        return $http.post('/user/changeAccountSettings', {account: data});
    }

    acctObject.getSenderPicture = function(data){
        return $http.get('/user/senderPicture/'+data);
    }

    acctObject.checkIfPending = function(data){
        return $http.post('/user/connPendingCheck', data);
    }

    acctObject.getListOfFAQs = function(){
        return $http.get('/user/listOfFAQs');
    }

    acctObject.sendFAQ = function(data){
        return $http.post('/user/sendFAQ', {faq: data});
    }

    acctObject.logout = function(account){

    }

    return acctObject;
});

angular.module('sbAdminApp').factory('fieldService', function(){
    var object = {};

    object.resourcesTypes = ['Food Supply', 'Money', 'Human Resource', 'Tools and Equipment', 'Medical Supplies',
        'Clothes and Personal Necessities', 'School and Office Supplies', 'School and Office Utilities', 'Construction Supplies'];

    object.descriptionForType = {
        'Tools_Equipment': [
            'Any Carpentry tools',
            'Any Plumbing tools',
            'Any Masonry tools',
            'Any Motor Mechanic tools',
            'Any Electrician tools and machines',
            'Any Blacksmith tools',
            'Any Welding machines',
            'Horticultural'
        ],
        'Medical_Supplies': [
            'Ace Bandages',
            'Alcohol',
            'Antibiotic Ointment',
            'Band-aids',
            'Bandages',
            'Betadine',
            'Blood Glucose Monitor',
            'Blood Glucose Lancets',
            'Blood Glucose Strips',
            'Bowls',
            'Bulb syringe',
            'Burn dressings',
            'Casting materials',
            'Delivery kits',
            'Dental Instruments',
            'Diapers (infant)',
            'Diapers (adult)',
            'Drapes or sterile fields',
            'Dressing change kits',
            'Eye pads',
            'Gauze',
            'Gloves',
            'Oxygen masks',
            'Plastic Emesis Basins',
            'Plastic Bowls',
            'Packing strips',
            'Personal hygiene supplies',
            'Syringes',
            'Thermometers'
        ],
        'Clothes_Personal_Necessities': [
            'Bags',
            'Bath Essentials',
            'Blanket',
            'Comb',
            'Clothes',
            'Dental Hygiene Essentials',
            'Diaper',
            'First Aid Items',
            'Napkins/Pads',
            'Toilet paper'
        ],
        'School_Office_Supplies': [
            'Binders',
            'Boxes, Tubes & Mailers',
            'Bulletin Boards',
            'Chalk Boards',
            'Cleaning & Maintenance Supplies',
            'Clips, Tacks & Rubber Bands',
            'Correction Supplies',
            'Cups, Plates & Cutlery',
            'Desktop Accessories',
            'Envelopes & Catalog Mailers',
            'Expandable Filing',
            'File Folders',
            'Light Bulbs',
            'Markers',
            'Pencils & Pens',
            'Pencil Sharpeners',
            'Report Covers',
            'Rolodex & Card Files',
            'Sheet Protectors',
            'Scissors, Rulers & Paper Trimmers',
            'Stamps & Pads',
            'Staplers & Paper Punches',
            'Tape, Glue & Adhesives Indexes'
        ],
        'School_Office_Utilities': [
            'Audio/Visual Equipment & Supplies',
            'Binding & Laminating Equipment & Supplies',
            'Calculators and Adding Machines',
            'Cameras',
            'Cash Registers',
            'CD Players',
            'Clocks',
            'Copiers',
            'DVD Players',
            'Fax Machines',
            'Overhead Projection Screens',
            'Overhead Projectors',
            'Printers',
            'Radios',
            'Routers',
            'Scanners',
            'Shredders',
            'Stereos',
            'Telephone Equipment',
            'Typewriters',
            'Televisions',
            'VCRs'
        ],
        'Construction_Supplies': [
            'Aluminum',
            'Bricks',
            'Cast Iron',
            'Cement',
            'Stainless Steel',
            'Solar Panel',
            'Lumber',
            'Plywood',
            'Moulding',
            'Tiles',
            'Windowpane'
        ]
    };

    object.getDescriptionRes = function(resource){
        switch (resource){
            case 'Tools and Equipment':
                return object.descriptionForType.Tools_Equipment;
            case 'Medical Supplies':
                return object.descriptionForType.Medical_Supplies;
            case 'Clothes and Personal Necessities':
                return object.descriptionForType.Clothes_Personal_Necessities;
            case 'School and Office Supplies':
                return object.descriptionForType.School_Office_Supplies;
            case 'School and Office Utilities':
                return object.descriptionForType.School_Office_Utilities;
            case 'Construction Supplies':
                return object.descriptionForType.Construction_Supplies;
        }
    };

    object.sectorTypes = ['Health and Nutrition', 'Education', 'Poverty Eradication', 'Rural Development', 'Environment'];

    object.subsector = {
        Health_Nutrition:[
            'Animal Health and Rights',
            'Bloodletting',
            'Health Care Plans',
            'Long-Term Care Facilities',
            'Medical Appliances & Equipment',
            'Medical Instruments & Supplies',
            'Specialized Health Services',
            'Family Planning',
            'Feeding Program',
            'Drug Delivery',
            'Rehabilitation'
        ],
        Education: [
            'Early childhood education',
            'Primary education',
            'Secondary education',
            'Technical & vocational education and training (TVET)',
            'Basic life skills for youth and adults',
            'Comprehensive sector policy design and development',
            'Higher education',
            'Out of school youth programs'
        ],
        Poverty_Eradication: [
            'Water and Sanitation',
            'Housing and Shelter',
            'Human Welfare',
            'Employment and Productivity',
            'Debt relief',
            'Population/Human Settlement Refugees Relief Services'
        ],
        Rural_Development: [
            'Agricultural primary production',
            'Forestry',
            'Land management',
            'Rural infrastructure',
            'Agricultural equipment',
            'Crop protection and disease control',
            'Animal production and health',
            'Rural Electrification'
        ],
        Environment: [
            'Sustainable management of Ecosystems',
            'Nature protection and Bio-diversity',
            'Marine environment and management of coastal areas',
            'Waste management',
            'Industrial pollution control',
            'Green Economy',
            'Environmental risks/disaster management'
        ]
    };

    object.getSubSector = function(sector){
        switch (sector){
            case 'Health and Nutrition':
                return object.subsector.Health_Nutrition;
            case 'Education':
                return object.subsector.Education;
            case 'Poverty Eradication':
                return object.subsector.Poverty_Eradication;
            case 'Rural Development':
                return object.subsector.Rural_Development;
            case 'Environment':
                return object.subsector.Environment;
        }
    };

    object.addNewItemProject = function(scope, type) {
        if(type == 'resource')
            scope.resourceSet.resource.push({inhand: 0});
        else if(type == 'sector')
            scope.sectorSet.sectors.push({});
        else
            scope.awardSet.awards.push({});
    };

    object.addNewItemAccount = function(scope, type) {
        if(type == 'resource')
            scope.resourceSet.resource.push({});
        else if(type == 'sector')
            scope.sectorSet.sectors.push({});
        else
            scope.awardSet.awards.push({});
    };

    object.removeItem = function(scope, type, index) {
        if(type == 'resource')
            scope.resourceSet.resource.splice(index, 1);
        else if(type == 'sector')
            scope.sectorSet.sectors.splice(index, 1);
        else
            scope.awardSet.awards.splice(index, 1);
    };

    object.activateField = function(resourceType, fieldnName){
        if(fieldnName == 'DescQty'){
            if(!resourceType){
                return false;
            }
            else{
                return true;
            }
        }
        else if(fieldnName == 'Desc'){
            switch (resourceType){
                case 'Money':
                    return false;
                case 'Food Supply':
                    return false;
                case 'Human Resource':
                    return false;
                default:
                    return true;
            }
        }
    };

    object.countryTypes = ["Brunei Darussalam", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar", "Philippines", "Singapore", "Thailand", "Vietnam"];

    return object;
});

//angular.module('sbAdminApp').factory('profileTabService', function(){
//    var tabControllerObject = {};
//
//    tabControllerObject.setTab = function(newTab, scope){
//        scope.tab = newTab;
//    };
//
//    tabControllerObject.isSet = function(tabNum, scope){
//        return scope.tab === tabNum;
//    };
//
//    return tabControllerObject;
//});