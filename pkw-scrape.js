var fs = require('fs');
var casper = require('casper').create();


casper.start('http://wybory2011.pkw.gov.pl/geo/pl/000000.html#tabs-2', function() {
    var results = [];

    var entries = this.evaluate(function() {
      var entryEl = document.querySelectorAll('#tab-2 .bord.all_left');
      return Array.prototype.map.call(entryEl, function(e, index) {
          var n = index + 1;
          return {
            id: n,
            text: 'Okręg ' + n,
            content: e.innerHTML,
            children: []
          }
      });
    });

    entries.forEach(function(entry, i) {

      var districtId = entry.id;
      var parts = entry.content.split('oraz');
      parts.forEach(function(part) {

        var type = part.split(':')[0];
        var vals = part.split(':')[1].split(',');

        vals.forEach(function(val, i) {
          var text;
          
          if (type === 'powiaty') {
            text = 'Powiat ' + val.trim()
          } else 
          if (type.indexOf('część obszaru miasta') !== -1) {
            text = type.substring(type.lastIndexOf(' ') + 1) + ': ' + val.trim();
          } else 
          if (type.indexOf('miast') !== -1) {
            text = 'Miasto ' + val.trim();
          } else {
            text = val.trim()
          }

          if (text.length) {
            entry.children.push({
              id: districtId + '-' + i,
              text: text
            })
            
          };
        });

      });

    });


    fs.write('./js/data.js', 'var AppDistrictData = ' + JSON.stringify(entries) + ';', 'w');

    this.exit();
});

casper.run();