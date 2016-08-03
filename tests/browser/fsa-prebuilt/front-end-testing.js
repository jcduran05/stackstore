describe('FrontEnd Tests',function(){
    beforeEach(module('fsaPreBuilt'));

    var $httpBackend;
    var $rootScope;
    beforeEach('Get tools', inject(function (_$httpBackend_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    var AUTH_EVENTS;
    var AuthService;
    var Session;
    beforeEach('Get factories', inject(function (_AuthService_, _Session_, _AUTH_EVENTS_) {
        AuthService = _AuthService_;
        Session = _Session_;
        AUTH_EVENTS = _AUTH_EVENTS_;
        Session.destroy();
    }));


})