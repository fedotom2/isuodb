'use strict';

const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

const sufpref = (str, prefix, suffix) => str.match(`${prefix}(.*?)${suffix}`)[1];

const URL = 'https://vn.isuo.org/schools/view/id/8761';
const results = [];


needle.get(URL, (err, res) => {
  if (err) throw err;

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
      results.push({
        'Область': oblast,
        'Повна назва': name,
        'E-mail': email,
        'Сайт': site
      });
    }

});

