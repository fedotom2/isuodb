'use strict';

const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const urlresolve = require('url').resolve;
const fs = require('fs');

const sufpref = (str, prefix, suffix) => str.match(`${prefix}(.*?)${suffix}`)[1];

// const URL = 'https://vn.isuo.org/authorities/schools-list/id/179';  +
// const URL = 'https://cg.isuo.org/authorities/schools-list/id/197';  +
// const URL = 'https://zt.isuo.org/authorities/schools-list/id/181';  +
// const URL = 'https://rv.isuo.org/authorities/schools-list/id/191';  +
// const URL = 'https://km.isuo.org/authorities/schools-list/id/194';  +
// const URL = 'https://te.isuo.org/authorities/schools-list/id/193';  +
// const URL = 'https://cv.isuo.org/authorities/schools-list/id/196';  +
// const URL = 'https://vl.isuo.org/authorities/schools-list/id/150';  +
// const URL = 'https://lv.isuo.org/authorities/schools-list/id/187';
// const URL = 'https://if.isuo.org/authorities/schools-list/id/183';
// const URL = 'https://zk.isuo.org/authorities/schools-list/id/182';  +

const results = [];

const getHTML = (url, callback) => {
  return new Promise((resolve, reject) => {
    needle.get(url, (err, res) => {
      if (err) reject(err);
      if (res === undefined) reject(new Error('Undefined response'));
      // console.log(res);
      // if (res.body === undefined) reject(new Error('Undefined response body'));

      const $ = cheerio.load(res.body);

      if ($('ul.tabs li').length === 1) {
        let oblast;
        let name;
        let email;
        let site;
        $('table.zebra-stripe tr th').each(function () {

          if ($(this).text() === 'Повна назва:') {
            if (name = $(this).next().text() !== undefined) {
              name = $(this).next().text();
            } else {
              name = '';
            }
          }

          if ($(this).text() === 'Поштова адреса:') {
            if ($(this).next().text() !== undefined) {
              oblast = $(this).next().text().split(',')[1].substr(1);
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

        });
        console.log('Область: \n' + oblast);
        console.log('Повна назва: \n' + name);
        console.log('E-mail: \n' + email);
        console.log('Сайт: \n' + site);
        console.log('\n');

        // results.push({
        //   'Область': oblast,
        //   'Повна назва': name,
        //   'E-mail': email,
        //   'Сайт': site
        // });

        resolve({
          'Область': oblast,
          'Повна назва': name,
          'E-mail': email,
          'Сайт': site
        });
      }

      $('.list a').each(function () {
        q.push(urlresolve(URL, $(this).attr('href')));
      });

      $('#pagination-digg ul li.active + li a').each(function () {
        if ($(this).attr('href') !== undefined)
          q.push(urlresolve(URL, $(this).attr('href')));
      });

      callback();
    });
  });
};

const q = tress((url, callback) => {
  getHTML(url, callback)
    .then(
      result => results.push(result),
      error => console.log(error.message)
    );
}, 10);

q.drain = function () {
  fs.writeFileSync('./db.json', JSON.stringify(results, null, 2));
};

q.push(URL);
