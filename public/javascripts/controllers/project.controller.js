/**
 * Created by Asus on 11/8/2016.
 */
angular.module('sbAdminApp').controller('createProjectController', function($scope, $http, $rootScope, fieldService, projectService, socketService, Authentication, toaster, $timeout, $state){
   //$scope.project = {title: '',
   //    picture: '',
   //    creator: $rootScope.account,
   //    startDate: new Date(),
   //    endDate: new Date(),
   //    budget: {amount: '', shown: false},
   //    sector: [],
   //    description: '',
   //    contactInfo: {emailAdd: '', telNo: '', website: ''},
   //    resources: $scope.resourceSet.resource,
   //    status: '',
   //    media: [],
   //    collaborators: []};

    Authentication.authentication();

    $scope.thisIsCreateProject = true;

    $scope.projectPicture = {};

    $scope.project = {};

    $scope.countries = ['Brunei Darussalam', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam'];

    $scope.countriesCity = {
        'BruneiDarussalam': [
             'Belait', 'Brunei Muara', 'Temburong', 'Tutong'
        ],
        'Cambodia': [
            'Banteay Mean Cheay','Batdambang','Kampong Cham','Kampong Chhnang','Kampong Spoe','Kampong Thum','Kampot','Kandal','Kaoh Kong','Kep','Kracheh','Mondol Kiri','Otdar Mean Cheay','Pailin','Phnum Penh','Pouthisat','Preah Seihanu','Preah Vihear','Prey Veng','Rotanah Kiri','Siem Reab','Stoeng Treng','Svay Rieng','Takev'
        ],
        'Indonesia': [
            'Aceh','Bali','Banten,Bengkulu','East Timor','Gorontalo','Irian Jaya','Jakarta Raya','Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan','Kalimantan Tengah','Kalimantan Timur','Kepulauan Bangka Belitung','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur','Riau','Sulawesi Selatan','Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan','Sumatera Utara','Yogyakarta'
        ],
        'Laos': [
            'Attapu','Bokeo','Bolikhamxai','Champasak','Houaphan','Khammouan','Louangnamtha','Louangphabang','Oudomxai','Phongsali','Salavan','Savannakhet','Viangchan','Xaignabouli','Xaisomboun','Xekong','Xiangkhoang'
        ],
        'Malaysia': [
            'Johor','Kedah','Kelantan','Labuan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu','Wilayah Persekutuan'
        ],
        'Myanmar': [
            'Ayeyarwady','Bago','Chin State','Kachin State','Kayah State','Kayin State','Magway','Mandalay','Mon State','Rakhine State','Sagaing','Shan State','Tanintharyi','Yangon'
        ],
        'Philippines': [
            'Abra','Agusan del Norte','Agusan del Sur','Aklan','Albay','Angeles','Antique','Aurora','Bacolod','Bago','Baguio','Bais','Basilan','Bataan','Batanes','Batangas','Benguet','Bohol','Bukidnon','Bulacan','Butuan','Cabanatuan','Cadiz','Cagayan','Cagayan de Oro','Calbayog','Caloocan','Camarines Norte','Camarines Sur','Camiguin','Canlaon','Capiz','Catanduanes','Cavite','Cebu','Cotabato','Dagupan','Danao','Dapitan','Davao','Davao del Sur','Davao Oriental','Dipolog','Dumaguete','Eastern Samar','General Santos','Gingoog','Ifugao','Iligan','Ilocos Norte','Ilocos Sur','Iloilo','Iriga','Isabela','Kalinga-Apayao','La Carlota','La Union','Laguna','Lanao del Norte','Lanao del Sur','Laoag','Lapu-Lapu','Legaspi','Leyte','Lipa','Lucena','Maguindanao','Mandaue','Manila','Marawi','Marinduque','Masbate','Mindoro Occidental','Mindoro Oriental','Misamis Occidental','Misamis Oriental','Mountain Province','Naga','Negros Occidental','Negros Oriental','North Cotabato','Northern Samar','Nueva Ecija','Nueva Vizcaya','Olongapo','Ormoc','Oroquieta','Ozamis','Pagadian','Palawan','Palayan','Pampanga','Pangasinan','Pasay','Puerto Princesa','Quezon','Quirino','Rizal','Romblon','Roxas','Samar','San Carlos Negros Occodental','San Carlos Pangasinan','San Jose','San Pablo','Silay','Siquijor','Sorsogon','South Cotabato','Southern Leyte','Sultan Kudarat','Sulu','Surigao','Surigao del Norte','Surigao del Sur','Tacloban','Tagaytay','Tagbilaran','Tangub','Tarlac','Tawitawi','Toledo','Trece Martires','Zambales','Zamboanga','Zamboanga del Norte','Zamboanga del Sur'
        ],
        'Singapore': [
            'Singapore'
        ],
        'Thailand': [
            'Amnat Charoen','Ang Thong','Buriram','Chachoengsao','Chai Nat','Chaiyaphum','Chanthaburi','Chiang Mai','Chiang Rai','Chon Buri','Chumphon','Kalasin','Kamphaeng Phet','Kanchanaburi','Khon Kaen','Krabi','Krung Thep Mahanakhon Bangkok','Lampang','Lamphun','Loei','Lop Buri','Mae Hong Son','Maha Sarakham','Mukdahan','Nakhon Nayok','Nakhon Pathom','Nakhon Phanom','Nakhon Ratchasima','Nakhon Sawan','Nakhon Si Thammarat','Nan','Narathiwat','Nong Bua Lamphu','Nong Khai','Nonthaburi','Pathum Thani','Pattani','Phangnga','Phatthalung','Phayao','Phetchabun','Phetchaburi','Phichit','Phitsanulok','Phra Nakhon Si Ayutthaya','Phrae','Phuket','Prachin Buri','Prachuap Khiri Khan','Ranong','Ratchaburi','Rayong','Roi Et','Sa Kaeo','Sakon Nakhon','Samut Prakan','Samut Sakhon','Samut Songkhram','Sara Buri','Satun','Sing Buri','Sisaket','Songkhla','Sukhothai','Suphan Buri','Surat Thani','Surin','Tak','Trang','Trat','Ubon Ratchathani','Udon Thani','Uthai Thani','Uttaradit','Yala','Yasothon'
        ],
        'Vietnam': [
            'An Giang','Ba Ria-Vung Tau','Bac Giang','Bac Kan','Bac Lieu','Bac Ninh','Ben Tre','Binh Dinh','Binh Duong','Binh Phuoc','Binh Thuan','Ca Mau','Can Tho','Cao Bang','Da Nang','Dac Lak','Dong Nai','Dong Thap','Gia Lai','Ha Giang','Ha Nam','Ha Noi','Ha Tay','Ha Tinh','Hai Duong','Hai Phong','Ho Chi Minh','Hoa Binh','Hung Yen','Khanh Hoa','Kien Giang','Kon Tum','Lai Chau','Lam Dong','Lang Son','Lao Cai','Long An','Nam Dinh','Nghe An','Ninh Binh','Ninh Thuan','Phu Tho','Phu Yen','Quang Binh','Quang Nam','Quang Ngai','Quang Ninh','Quang Tri','Soc Trang','Son La','Tay Ninh','Thai Binh','Thai Nguyen','Thanh Hoa','Thua Thien-Hue','Tien Giang','Tra Vinh','Tuyen Quang','Vinh Long','Vinh Phuc','Yen Bai'
        ]
    };

    $scope.GetSelectedCountry = function (country) {
        //var e = document.getElementById("country");
        //$scope.strCountry = e.options[e.selectedIndex].text;
        switch(country){
            case 'Brunei Darussalam':
                return $scope.countriesCity.BruneiDarussalam;
            case 'Cambodia':
                return $scope.countriesCity.Cambodia;
            case 'Indonesia':
                return $scope.countriesCity.Indonesia;
            case 'Laos':
                return $scope.countriesCity.Laos;
            case 'Malaysia':
                return $scope.countriesCity.Malaysia;
            case 'Myanmar':
                return $scope.countriesCity.Myanmar;
            case 'Philippines':
                return $scope.countriesCity.Philippines;
            case 'Singapore':
                return $scope.countriesCity.Singapore;
            case 'Thailand':
                return $scope.countriesCity.Thailand;
            case 'Vietnam':
                return $scope.countriesCity.Vietnam;
        }
    };

    $scope.resourcesTypes = fieldService.resourcesTypes;

    $scope.sectorTypes = fieldService.sectorTypes;

    $scope.getSubSector = function(sector){
        return fieldService.getSubSector(sector);
    }

    $scope.resourceSet = {
        resource: []
    };

    $scope.sectorSet = {
        sectors: []
    };

    $scope.addNewField = function(type){
        fieldService.addNewItemProject($scope, type);
    };

    $scope.removeField = function(index, type){
        fieldService.removeItem($scope, type, index);
    };

    $scope.activateField = function(resourceType, fieldName){
        return fieldService.activateField(resourceType, fieldName);
    };

    $scope.getDescriptionRes = function(resource){
        return fieldService.getDescriptionRes(resource);
    };

    $scope.saveChanges = function(){
        $scope.project.sector = [];
        $scope.project.creator = $rootScope.account._id;
        $scope.project.resources = $scope.resourceSet.resource;

        if($scope.projectPicture.base64) {
            $scope.project.picture = $scope.projectPicture.base64.toString();
        }
        //$scope.project.picture = $scope.projectPicture.base64.toString();

        for(i = 0; i < $scope.sectorSet.sectors.length; i++){
            $scope.project.sector.push({type: $scope.sectorSet.sectors[i].type, subsector: $scope.sectorSet.sectors[i].subsector});
        }

        console.log($scope.project.picture);

        //$scope.project.address.country = $scope.strCountry;
        //$scope.project.status = 'Ongoing';

        projectService.createProject($scope.project).then(function(response){
            $scope.createdProject = response.data.project;
            toaster.pop('success', 'Creation Successful', 'Project successfully created!');
            $timeout(function(){
                $state.go('dashboard.home')
            }, 2000);
            //$scope.showSuccess($rootScope.$event);
            socketService.emit('join-room', response.data._id);
        }, function(err){
            $scope.statusOfCreation = err.statusText;
        });
    };

    // For datepicker

    //$scope.minStartDate = new Date();
    $scope.minEndDate = $scope.project.startDate;

    $scope.datepickerPopup1 = {
        opened: false
    }

    $scope.datepickerPopup2 = {
        opened: false
    }

    function disabled(data) {
        var date = data.date;

        if($scope.datepickerPopup.opened){
            return data.date > $scope.minStartDate;
        }
        else{
            return data.date > $scope.minEndDate;
        }
    }

    $scope.dateFormat = 'shortDate';

    $scope.dateOptions1 = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.dateOptions2 = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.openDatePicker = function(number){
        if(number == 1)
            $scope.datepickerPopup1.opened = true;
        else
            $scope.datepickerPopup2.opened = true;
    }

});

angular.module('sbAdminApp').controller('editProjectController', function($scope, $http, $rootScope, fieldService, projectService, socketService, Authentication, $location, $state, toaster, $timeout){
    Authentication.authentication();

    $scope.thisIsCreateProject = false;

    projectService.getProject($location.search().name).then(function(response){
        if(response.data.status) {
            $scope.project = response.data.project;
            console.log('project: '+$scope.project.title);

            $scope.resourceSet = {
                resource: $scope.project.resources
            };

            $scope.sectorSet = {
                sectors: $scope.project.sector
            };

            //$scope.projectPicture = $scope.project.picture;

            var startDate = new Date($scope.project.startDate);
            var endDate = new Date($scope.project.endDate);
            $scope.project.startDate = startDate;
            $scope.project.endDate = endDate;

            //console.log('startDate: '+$scope.project.startDate+' endDate: '+$scope.project.endDate);

            //$scope.minEndDate = $scope.project.startDate;

        }
    });

    $scope.mediaPictures = [];

    $scope.countries = ['Brunei Darussalam', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam'];

    $scope.countriesCity = {
        'BruneiDarussalam': [
            'Belait', 'Brunei Muara', 'Temburong', 'Tutong'
        ],
        'Cambodia': [
            'Banteay Mean Cheay','Batdambang','Kampong Cham','Kampong Chhnang','Kampong Spoe','Kampong Thum','Kampot','Kandal','Kaoh Kong','Kep','Kracheh','Mondol Kiri','Otdar Mean Cheay','Pailin','Phnum Penh','Pouthisat','Preah Seihanu','Preah Vihear','Prey Veng','Rotanah Kiri','Siem Reab','Stoeng Treng','Svay Rieng','Takev'
        ],
        'Indonesia': [
            'Aceh','Bali','Banten,Bengkulu','East Timor','Gorontalo','Irian Jaya','Jakarta Raya','Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan','Kalimantan Tengah','Kalimantan Timur','Kepulauan Bangka Belitung','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur','Riau','Sulawesi Selatan','Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan','Sumatera Utara','Yogyakarta'
        ],
        'Laos': [
            'Attapu','Bokeo','Bolikhamxai','Champasak','Houaphan','Khammouan','Louangnamtha','Louangphabang','Oudomxai','Phongsali','Salavan','Savannakhet','Viangchan','Xaignabouli','Xaisomboun','Xekong','Xiangkhoang'
        ],
        'Malaysia': [
            'Johor','Kedah','Kelantan','Labuan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu','Wilayah Persekutuan'
        ],
        'Myanmar': [
            'Ayeyarwady','Bago','Chin State','Kachin State','Kayah State','Kayin State','Magway','Mandalay','Mon State','Rakhine State','Sagaing','Shan State','Tanintharyi','Yangon'
        ],
        'Philippines': [
            'Abra','Agusan del Norte','Agusan del Sur','Aklan','Albay','Angeles','Antique','Aurora','Bacolod','Bago','Baguio','Bais','Basilan','Bataan','Batanes','Batangas','Benguet','Bohol','Bukidnon','Bulacan','Butuan','Cabanatuan','Cadiz','Cagayan','Cagayan de Oro','Calbayog','Caloocan','Camarines Norte','Camarines Sur','Camiguin','Canlaon','Capiz','Catanduanes','Cavite','Cebu','Cotabato','Dagupan','Danao','Dapitan','Davao','Davao del Sur','Davao Oriental','Dipolog','Dumaguete','Eastern Samar','General Santos','Gingoog','Ifugao','Iligan','Ilocos Norte','Ilocos Sur','Iloilo','Iriga','Isabela','Kalinga-Apayao','La Carlota','La Union','Laguna','Lanao del Norte','Lanao del Sur','Laoag','Lapu-Lapu','Legaspi','Leyte','Lipa','Lucena','Maguindanao','Mandaue','Manila','Marawi','Marinduque','Masbate','Mindoro Occidental','Mindoro Oriental','Misamis Occidental','Misamis Oriental','Mountain Province','Naga','Negros Occidental','Negros Oriental','North Cotabato','Northern Samar','Nueva Ecija','Nueva Vizcaya','Olongapo','Ormoc','Oroquieta','Ozamis','Pagadian','Palawan','Palayan','Pampanga','Pangasinan','Pasay','Puerto Princesa','Quezon','Quirino','Rizal','Romblon','Roxas','Samar','San Carlos Negros Occodental','San Carlos Pangasinan','San Jose','San Pablo','Silay','Siquijor','Sorsogon','South Cotabato','Southern Leyte','Sultan Kudarat','Sulu','Surigao','Surigao del Norte','Surigao del Sur','Tacloban','Tagaytay','Tagbilaran','Tangub','Tarlac','Tawitawi','Toledo','Trece Martires','Zambales','Zamboanga','Zamboanga del Norte','Zamboanga del Sur'
        ],
        'Singapore': [
            'Singapore'
        ],
        'Thailand': [
            'Amnat Charoen','Ang Thong','Buriram','Chachoengsao','Chai Nat','Chaiyaphum','Chanthaburi','Chiang Mai','Chiang Rai','Chon Buri','Chumphon','Kalasin','Kamphaeng Phet','Kanchanaburi','Khon Kaen','Krabi','Krung Thep Mahanakhon Bangkok','Lampang','Lamphun','Loei','Lop Buri','Mae Hong Son','Maha Sarakham','Mukdahan','Nakhon Nayok','Nakhon Pathom','Nakhon Phanom','Nakhon Ratchasima','Nakhon Sawan','Nakhon Si Thammarat','Nan','Narathiwat','Nong Bua Lamphu','Nong Khai','Nonthaburi','Pathum Thani','Pattani','Phangnga','Phatthalung','Phayao','Phetchabun','Phetchaburi','Phichit','Phitsanulok','Phra Nakhon Si Ayutthaya','Phrae','Phuket','Prachin Buri','Prachuap Khiri Khan','Ranong','Ratchaburi','Rayong','Roi Et','Sa Kaeo','Sakon Nakhon','Samut Prakan','Samut Sakhon','Samut Songkhram','Sara Buri','Satun','Sing Buri','Sisaket','Songkhla','Sukhothai','Suphan Buri','Surat Thani','Surin','Tak','Trang','Trat','Ubon Ratchathani','Udon Thani','Uthai Thani','Uttaradit','Yala','Yasothon'
        ],
        'Vietnam': [
            'An Giang','Ba Ria-Vung Tau','Bac Giang','Bac Kan','Bac Lieu','Bac Ninh','Ben Tre','Binh Dinh','Binh Duong','Binh Phuoc','Binh Thuan','Ca Mau','Can Tho','Cao Bang','Da Nang','Dac Lak','Dong Nai','Dong Thap','Gia Lai','Ha Giang','Ha Nam','Ha Noi','Ha Tay','Ha Tinh','Hai Duong','Hai Phong','Ho Chi Minh','Hoa Binh','Hung Yen','Khanh Hoa','Kien Giang','Kon Tum','Lai Chau','Lam Dong','Lang Son','Lao Cai','Long An','Nam Dinh','Nghe An','Ninh Binh','Ninh Thuan','Phu Tho','Phu Yen','Quang Binh','Quang Nam','Quang Ngai','Quang Ninh','Quang Tri','Soc Trang','Son La','Tay Ninh','Thai Binh','Thai Nguyen','Thanh Hoa','Thua Thien-Hue','Tien Giang','Tra Vinh','Tuyen Quang','Vinh Long','Vinh Phuc','Yen Bai'
        ]
    };

    $scope.GetSelectedCountry = function (country) {
        //var e = document.getElementById("country");
        //$scope.strCountry = e.options[e.selectedIndex].text;
        switch(country){
            case 'Brunei Darussalam':
                return $scope.countriesCity.BruneiDarussalam;
            case 'Cambodia':
                return $scope.countriesCity.Cambodia;
            case 'Indonesia':
                return $scope.countriesCity.Indonesia;
            case 'Laos':
                return $scope.countriesCity.Laos;
            case 'Malaysia':
                return $scope.countriesCity.Malaysia;
            case 'Myanmar':
                return $scope.countriesCity.Myanmar;
            case 'Philippines':
                return $scope.countriesCity.Philippines;
            case 'Singapore':
                return $scope.countriesCity.Singapore;
            case 'Thailand':
                return $scope.countriesCity.Thailand;
            case 'Vietnam':
                return $scope.countriesCity.Vietnam;
        }
    };

    $scope.resourcesTypes = fieldService.resourcesTypes;

    $scope.sectorTypes = fieldService.sectorTypes;

    $scope.getSubSector = function(sector){
        return fieldService.getSubSector(sector);
    }

    $scope.addNewField = function(type){
        fieldService.addNewItemProject($scope, type);
    };

    $scope.removeField = function(index, type){
        fieldService.removeItem($scope, type, index);
    };

    $scope.activateField = function(resourceType, fieldName){
        return fieldService.activateField(resourceType, fieldName);
    };

    $scope.getDescriptionRes = function(resource){
        return fieldService.getDescriptionRes(resource);
    };

    $scope.saveChanges = function(){
        $scope.project.sector = [];
        $scope.project.creator = $rootScope.account._id;
        $scope.project.resources = $scope.resourceSet.resource;

        if($scope.projectPicture) {
            $scope.project.picture = $scope.projectPicture.base64.toString();
        }

        if($scope.mediaPictures.length > 0){
            for(i = 0; i < $scope.mediaPictures.length; i++){
                $scope.project.media.push($scope.mediaPictures[i].base64.toString());
            }
        }

        for(i = 0; i < $scope.sectorSet.sectors.length; i++){
            $scope.project.sector.push({type: $scope.sectorSet.sectors[i].type, subsector: $scope.sectorSet.sectors[i].subsector});
        }

        console.log('picture: '+$scope.project.picture);

        //$scope.project.address.country = $scope.strCountry;
        //$scope.project.status = 'Ongoing';

        projectService.saveChanges($scope.project).then(function(response){
            //$scope.project = response.data.project;
            //$scope.showSuccess($rootScope.$event);
            toaster.pop('success', 'Update Successful', 'Project updated successfully!');
            $timeout(function(){
                //$state.go('dashboard.home')
                $rootScope.selectedProject = response.data.project;
                $location.url('/dashboard/projprofile?name='+response.data.project.title);
            }, 2000);
        }, function(err){
            $scope.statusOfCreation = err.statusText;
        });
    };

    $scope.cancelChanges = function(){
        $location.url('/dashboard/projprofile?name='+$scope.project.title)
    }

    // For datepicker

    //$scope.minStartDate = new Date();

    $scope.datepickerPopup1 = {
        opened: false
    }

    $scope.datepickerPopup2 = {
        opened: false
    }

    function disabled(data) {
        var date = data.date;

        if($scope.datepickerPopup.opened){
            return data.date > $scope.minStartDate;
        }
        else{
            return data.date > $scope.minEndDate;
        }
    }

    $scope.dateFormat = 'shortDate';

    $scope.dateOptions1 = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.dateOptions2 = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.openDatePicker = function(number){
        if(number == 1)
            $scope.datepickerPopup1.opened = true;
        else
            $scope.datepickerPopup2.opened = true;
    }

});

angular.module('sbAdminApp').controller('projectListController', function($scope, $http, $rootScope, fieldService, projectService, socketService, Authentication, $location, $state, toaster){
    Authentication.authentication();

    $scope.ownedProjects = [];
    $scope.collaboratedProjects = [];

    projectService.getAllInitiatedProjects($rootScope.account._id).then(function(response){
        if(response.data.status){
            $scope.ownedProjects = response.data.projects;
        }
    });

    projectService.getAllProjectCollaboration($rootScope.account._id).then(function(response){
        if(response.data.status){
            $scope.collaboratedProjects = response.data.projects;
        }
    });

    $scope.goToProjectProfile = function(project){
        $location.url('/dashboard/projprofile?name='+project.title);
    }
});

