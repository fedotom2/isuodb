'use strict';

const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

const URL = 'https://vn.isuo.org/authorities/schools-list/id/179/';
const results = [];

const q = tress((url, callback) => {

  needle.get(url, (err, res) => {
    if (err) throw err;

    const $ = cheerio.load(res.body);

    $('.list a').each(function () {
      results.push({
        url: resolve(URL, $(this).attr('href'))
      });
    });

    $('#pagination-digg ul li.active + li a').each(function () {
      if ($(this).attr('href') !== undefined)
        q.push(resolve(URL, $(this).attr('href')));
    });

    callback();
  });
}, 10);

q.drain = function () {
  fs.writeFileSync('./db.json', JSON.stringify(results, null, 2));
};

q.push(URL);


/*
const $ = cheerio.load(res.body);
const hash = sufpref($('a.static').attr('onclick'), '\'', '\'');
console.log($(unescape(hash)).text());
*/