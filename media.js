var client = require('cheerio-httpcli');
var PREF_LIST = require('./preflist');

var MediaScraper = function () {
    this.indeedUrl = 'http://jp.indeed.com/%E6%B1%82%E4%BA%BA';
    this.currentPrefIndex = 0;
    this.currentPage = 0;
    this.pageLimit = -1;
    this.limit = 100;
    this.prefRemain = PREF_LIST.length;
    this.pageRemain = -1;
    this.prefRet = {};
    this.ret = {};
    this.param = {
        jt: 'all',
        radius: 0,
        st: 'jobsite',
        fromage: 'any',
        limit: 100,
        l: PREF_LIST[this.currentPrefIndex],
        psf: 'advsrch',
        start: this.currentPage
    };

    this.update = function () {
        if (this.prefRemain === 0) {
            console.log(JSON.stringify(this.ret));
        } else {
            this.param.limit = this.limit;
            this.param.start = this.currentPage;
            this.param.l = PREF_LIST[this.currentPrefIndex];
            client.fetch(this.indeedUrl, this.param, 'UTF-8', this.parse.bind(this));
        }
    };

    this.nextPref = function () {
        this.ret[PREF_LIST[this.currentPrefIndex]] = this.prefRet;
        this.currentPage = 0;
        this.pageLimit = -1;
        this.limit = 100;
        this.pageRemain = -1;
        this.prefRet = {};
        this.currentPrefIndex++;
        this.prefRemain--;
    };

    this.nextPage = function () {
        this.currentPage += 100;
        this.pageRemain -= this.limit;

        console.log(PREF_LIST[this.currentPrefIndex] + ':' + this.pageRemain);

        if (this.pageRemain <= 100) {
            this.limit = this.pageRemain;
        }

        this.param.start = this.currentPage;
    };

    this.parse = function (err, $, res) {
        if (err) {
            console.log('Retry...');
            this.update();
        } else {

            if (this.pageLimit === -1) {
                this.pageLimit = parseInt($('#searchCount').text().replace(/求人検索結果 /, '').replace(/ 件中.+/, '').replace(/,/, ''));
                this.pageRemain = this.pageLimit;
            }

            var _this = this;
            $('span.result-link-source').each(function (idx) {
                var media = $(this).text();
                if (!_this.prefRet[media]) {
                    _this.prefRet[media] = 0;
                }
                _this.prefRet[media]++;
            });

            if (this.pageRemain === 0) {
                console.log(JSON.stringify(this.prefRet));
                this.nextPref();
            } else {
                this.nextPage();
            }
        }

        this.update();
    };
};

var m = new MediaScraper();
m.update();
