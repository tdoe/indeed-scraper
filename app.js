var client = require('cheerio-httpcli');
var PREF_LIST = require('./preflist');

function PrefScraper() {
    this.remain = PREF_LIST.length - 1;
    this.currentIndex = 0;
    this.ret = {};
    this.indeedUrl = 'http://jp.indeed.com/%E6%B1%82%E4%BA%BA';
    this.params = {
        jt: 'all',
        st: 'salary',
        radius: 0,
        fromage: 'any',
        limit: 10,
        psf: 'advsrch',
        l: PREF_LIST[this.currentIndex]
    };

    this.parse = function (err, $, res) {
        if (err) {
            console.log('retry...');
        } else {
            this.ret[PREF_LIST[this.currentIndex]] = parseInt($('#searchCount').text().replace(/求人検索結果 /, '').replace(/ 件中 1 - 10/, '').replace(/,/, ''));
            console.log(PREF_LIST[this.currentIndex] + ' : ' + this.ret[PREF_LIST[this.currentIndex]]);
            this.currentIndex++;
            this.remain--;
        }
        this.update();
    };

    this.update = function () {
        if (this.remain === -1) {
            console.log(JSON.stringify(this.ret));
        } else {
            this.params.l = PREF_LIST[this.currentIndex];
            client.fetch(this.indeedUrl, this.params, 'UTF-8', this.parse.bind(this));
        }
    };
}

var p = new PrefScraper();
p.update();

var e = new PrefScraper();
e.params.st = 'employer';
e.update();
