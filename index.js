'use strict';

const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

const sufpref = (str, prefix, suffix) => str.match(`${prefix}(.*?)${suffix}`)[1];

const URL = 'https://vn.isuo.org/authorities/schools-list/id/179/';
const results = [];

const q = tress((url, callback) => {

  needle.get(url, (err, res) => {
    if (err) throw err;

    const $ = cheerio.load(res.body);

    console.log($('table.zebra-stripe tr.even th').html());
    if ($('table.zebra-stripe tr.even th').html() === 'Повна назва:') {
      $('table.zebra-stripe tr th').each(function () {
        
        let oblast;
        let name;
        let email;
        let site;

        if ($(this).text() === 'Повна назва:') {
          if (name = $(this).next().text() !== undefined) {
            name = $(this).next().text();
          } else {
            name = '';
          }
        }

        if ($(this).text() === 'Поштова адреса:') {
          if ($(this).next().text() !== undefined) {
            oblast = $(this).next().text().split(',')[1];
          } else {
            oblast = '';
          }
        }

        if ($(this).text() === 'E-mail:') {
          if ($(this).next().children().attr('onclick') !== undefined) {
            const hash = sufpref($(this).next().children().attr('onclick'), '\'', '\'');
            email = $(unescape(hash)).text();
          } else {
            email = '';
          }
        }

        if ($(this).text() === 'Сайт:') {
          if ($(this).next().children().attr('href') !== undefined) {
            site = $(this).next().children().attr('href');
          } else {
            site = '';
          }
        }

        console.log('Область: \n' + oblast);
        console.log('Повна назва: \n' + name);
        console.log('E-mail: \n' + email);
        console.log('Сайт: \n' + site);
        console.log('\n');

        results.push({
          'Область': oblast,
          'Повна назва': name,
          'E-mail': email,
          'Сайт': site
        });
      });
    }

    $('.list a').each(function () {
      q.push(resolve(URL, $(this).attr('href')));
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
