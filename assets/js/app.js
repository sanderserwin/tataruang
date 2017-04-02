var app = angular.module('tataRuang', ['angular-flexslider']);
firstLoad = true;

function imgOnLoad(el) {
    $(el).parent().addClass('loaded');
}

app.controller('mainController', function ($scope, $http) {
    $http.get('assets/model.json')
    .then(function (response) {
        $scope.model = response.data;
    });

    $scope.SetProjects = function (menu) {
        var yearGroup = {};
        var allProjectsByYear = [];

        menu.Categories.forEach(function (category) { allProjectsByYear = allProjectsByYear.concat(category.ProjectsByYear) });
        for (var i = 0; i < allProjectsByYear.length; i++) {
            var year = allProjectsByYear[i].Year;
            if (!yearGroup[year]) {
                yearGroup[year] = [];
            }
            yearGroup[year].push(allProjectsByYear[i].Projects);
        }

        allProjectsByYear = [];

        for (var year in yearGroup) {
            var projects = [];

            yearGroup[year].forEach(function (project) { projects = projects.concat(project) });
            allProjectsByYear.push({ Year: year, Projects: projects });
        }

        $scope.projectsByYear = allProjectsByYear;
        $scope.SelectedMenuTitle = menu.Name;
        $scope.SelectedMenuSubtitle = '';
        $scope.SelectedMenuDescription = menu.Categories[0].Description;

        if ($scope.projectsByYear.length > 0)
            History.pushState({ classState: 'projects' }, "Tata Ruang Architects - " + $scope.SelectedMenuTitle, "?projects");
    }

    $scope.SetProjectList = function (project) {
        $scope.projectDetail = project;
        History.pushState({ classState: 'projList' }, "Tata Ruang Architects - " + project.Name, "?projList");
    }

    $scope.SetProjectDetails = function (project, projectImg) {
        var index = project.Images.indexOf(projectImg);
        $('.flexslider').flexslider(index);
        History.pushState({ classState: 'projDetails' }, "Tata Ruang Architects - " + project.Name, "?projDetails");
    }

    $scope.SetCompanyProfile = function (model) {
        $scope.companyProfile = model;
        $scope.SelectedMenuTitle = model.Title;
        $scope.SelectedMenuSubtitle = model.Subtitle;
        $scope.SelectedMenuDescription = model.Description;
        History.pushState({ classState: 'comPro' }, "Tata Ruang Architects - Company Profile", "?comPro");
    }
});

$(function (e) {
    $('html,body').scrollTop(0);

    $('#explore_nav').click(function () {
        var navTop = $('#navigation').offset().top;

        $('html').removeClass('fixed-home');
        firstLoad = false;

        $('html,body').animate({
            scrollTop: navTop + "px"
        }, 1000);
    });

    $('#contact_us').click(function () {
        var contactTop = $('#contact_section').offset().top;

        $('html,body').animate({
            scrollTop: contactTop + "px"
        }, 1000);
    });

    $(".light-slider-home").lightSlider({
        item: 1,
        autoWidth: false,
        controls: false,
        loop: true,
        auto: true,
        speed: 1000,
        pause: 3000,
        thumbItem: 0,
        pager: false
    });

    $('.close-projects-container').click(function () {
        window.history.back();
    });

    $('.close-project-detail').click(function () {
        window.history.back();
    });

    $('#submit_btn').click(function () {
        $.ajax({
            type: "POST",
            url: "sendmail.php",
            data: { email: document.getElementById('email_input').value, subject: document.getElementById('subject_input').value, message: document.getElementById('message_input').value }
        }).done(function (msg) {
            alert("Data Saved: " + msg);
        });
    });

    function CloseContainer(container) {
        if (!container.hasClass('projects-list-container'))
            container.addClass('projects-container-delay');

        $('html').removeClass('overflow-hidden');

        container[0].offsetHeight;
        container.removeClass('active');

        if (!container.hasClass('projects-list-container'))
            setTimeout(function () {
                container.removeClass('projects-container-delay');
            }, 600);
    }

    // Bind to State Change
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        // Log the State
        var state = History.getState(); // Note: We are using History.getState() instead of event.state

        switch (state.data.classState) {
            case 'projects':
                if ($('.projects-list-container').hasClass('active')) {
                    //close projects list
                    CloseContainer($('.projects-list-container'));
                }
                else {
                    // open projects container
                    $('.projects-container').scrollTop(0);
                    $('.projects-container').addClass('active');
                    $('html').addClass('overflow-hidden');
                }
                break;
            case 'projList':
                if ($('.project-detail-container').hasClass('active')) {
                    //close project details
                    $('.project-detail-container').removeClass('active');
                }
                else {
                    // open projects list
                    $('.projects-list-container').scrollTop(0);
                    $('.projects-list-container').addClass('active');
                }
                break;
            case 'projDetails':
                $('.project-detail-container').addClass('active');
                break;
            case 'comPro':
                // open company profile
                var currentTop = $(window).scrollTop();

                $('html').addClass('overflow-hidden');
                $('.company-profile').addClass('active');
                break;
            default:
                if ($('.company-profile').hasClass('active')) {
                    //close company profile
                    CloseContainer($('.company-profile'));
                }
                else if ($('.projects-container').hasClass('active')) {
                    // close projects container
                    CloseContainer($('.projects-container'));
                }
                break;
        }
    });

});