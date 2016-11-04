'use strict';
var schedAPI = require('./schedAPI');
var handlebars = require("handlebars");
var fs = require('fs');
var partialsDir = __dirname + '/template/partials';

/** Retorna as informações do sched e gera as placas em html */
schedAPI.getSessionExport((err,session) => {
  session = session.filter((session)=>{
    return session.venue !== "Foyer";
  })
  let data = {"data": session};
  generate(data);
})



/** Gera o html com as placas baseado no template */
function generate(data){

  fs.access('./out', function(err){
    if(err) fs.mkdirSync('./out');
      fs.readFile('./template/grid.html', 'utf-8', function(error, source){
        var name = 'placa';
        var template = fs.readFileSync(partialsDir + '/' + name + '.hbs', 'utf8');
        prepareHBS(handlebars);
        handlebars.registerPartial(name, template);
        template = handlebars.compile(source);
        var html = template(data);
        
        fs.writeFile('./out/index.html', html, (err) => {
          if (err) throw err;
        });
      });
  });

}


function prepareHBS(hbs){
  hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
  });


  hbs.registerHelper('date_info', function(data) {
    var moment = require('moment');
    moment.locale('pt-br');
    var date = moment(data);

    return new hbs.SafeString (date.format("dddd - DD/MM - HH:mm"));
  });

  hbs.registerHelper('authors', function(data) {
    var str;
    
    var authors = data.map(function(author){
      return author.name;
    })

    return new hbs.SafeString ( authors.join(" e ") );
  });

  hbs.registerHelper('hashtags', function(data) {
    var str;
    var tags = data.split(",")
    tags = tags.map(function(tag){
      return "#"+tag.trim();
    })

    return new hbs.SafeString ( tags.join(" ") );
  });
}

