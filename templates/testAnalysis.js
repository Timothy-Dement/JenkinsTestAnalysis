var shell = require('shelljs');
var https = require('https');
var jenkinsapi = require('jenkins-api');
var fs = require('fs'), xml2js = require('xml2js');

var jenkins = jenkinsapi.init('http://admin:admin@localhost:8080/');
const COMMIT_LIMIT=5;
var lastBuildNumber = 0;
var testResults = {};

//create the directory to collect the result
shell.cd('/home/{{ ansible_user }}/iTrust2-v1/');
shell.mkdir('-p','test-analysis');

//get the last build information
jenkins.last_build_info('itrust-job',function(err, data) {

  if (err){ return console.log(err); }

  lastBuildNumber = data.number;

  aggregateResults(lastBuildNumber,0);

});

//get results and backtrack
function aggregateResults(n,i){
  let build = String(n-i);
  testResults[build] = {};
  shell.ls(`/var/lib/jenkins/jobs/itrust-job/builds/${n-i}/archive/iTrust2/target/surefire-reports/`).forEach(function(file,index,array){
    var parser = new xml2js.Parser();
    testResults[build][file] = {};

    fs.readFile(`/var/lib/jenkins/jobs/itrust-job/builds/${n-i}/archive/iTrust2/target/surefire-reports/${file}`, function(err, data) {
      parser.parseString(data, function (err, result) {
        if(result.testsuite['$'].failures==='0')
        testResults[build][file].success = true;
        else {
          testResults[build][file].success = false;
        }

        testResults[build][file].time = result.testsuite['$'].time;

        //only for last index if increment i
        if(index===(array.length-1)){
          i=i+1;
          if(i<COMMIT_LIMIT){
            aggregateResults(n,i);
          }
          else{
            let finalOutput = JSON.stringify(testResults);
            fs.writeFileSync("/home/{{ ansible_user }}/iTrust2-v1/test-analysis/output.json", finalOutput);
          }
        }
      });
    });


  });
}
