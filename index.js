#!/usr/bin/env node
 
/**
 * Module dependencies.
 */
 
const program = require('commander');
const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const inquirer = require('inquirer');
const process = require('process');
const Path = require('path');
const SEP = Path.sep;

function isApp(o){
  return o.pages && Array.isArray(o.pages) && o.pages.length > 0
}

/**
 * 向上级目录递归查找文件
 * @param filepath 文件路径
 */
function findAppJson(filepath){
  let appfile = Path.join(filepath, './app.json');
  if(fs.pathExistsSync(appfile)){
    let json = jsonfile.readFileSync(appfile)
    if(isApp(json)){
      return {
        filepath: appfile,
        json: json
      }
    }
  }else if(filepath.split(SEP).length > 3){
    findAppJson(Path.join(filepath, `..${SEP}`))
  }
  return null
}



program
.command('switch <dir>')
.action(function (dir, cmd) {
  let _path = Path.join(process.cwd(), dir);
  let app = findAppJson(_path);

  inquirer
  .prompt([
    {
      type: 'checkbox',
      message: 'Select home index',
      name: 'toppings',
      choices: app.json.pages,
      validate: function(answer) {
        if (answer.length > 2) {
          return 'You must choose at most one topping.';
        }
        return true;
      }
    }
  ])
  .then(answers => {
    let index  =  app.json.pages.indexOf(answers);
    app.json.pages.unshift(app.json.pages.splice(index,1)[0]);
    jsonfile.writeFileSync(app.filepath, app.json, { spaces: 4 },);
    console.log('Home index has switched')
  });

})

program.parse(process.argv)
