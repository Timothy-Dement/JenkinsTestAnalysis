var shell = require('shelljs');
var https = require('https');
var jenkinsapi = require('jenkins-api');
var fs = require('fs'), xml2js = require('xml2js');

var jenkins = jenkinsapi.init('http://{{ jenkins_username }}:{{ jenkins_password }}@localhost:8081/');
const COMMIT_LIMIT=Number(process.argv[2]);
var lastBuildNumber = 0;
var testResults = {};

//create the directory to collect the result
shell.cd('/home/{{ ansible_user }}/');
shell.mkdir('-p','test-analysis');

//get the last build information
jenkins.last_build_info('project_itrust_job',function(err, data) {

  if (err){ return console.log(err); }

  lastBuildNumber = data.number;

  aggregateResults(lastBuildNumber,0);

});

//get results and backtrack
function aggregateResults(n,i){
  let build = String(n-i);
  testResults[build] = {};
  shell.ls(`/var/lib/jenkins/jobs/project_itrust_job/builds/${n-i}/archive/iTrust2/target/surefire-reports/`).forEach(function(file,index,array){
    var parser = new xml2js.Parser();
    testResults[build] = {};

    fs.readFile(`/var/lib/jenkins/jobs/project_itrust_job/builds/${n-i}/archive/iTrust2/target/surefire-reports/${file}`, function(err, data) {
      parser.parseString(data, function (err, result) {
        result.testsuite.testcase.forEach(function(test,index,array){
          testResults[build][test['$'].name] = {time:test['$'].time,success:test.hasOwnProperty('failure')?0:1};
        });

        //only for last index if increment i
        if(index===(array.length-1)){
          i=i+1;
          if(i<COMMIT_LIMIT){
            aggregateResults(n,i);
          }
          else{
            //console.log(testResults);
            analyzeTests(testResults);
          }
        }
      });
    });
  });
}

function analyzeTests(aggrResults){

  let finalResultsSuccess = {},finalResultsArraySuccess=[];
  let finalResultsFailure = {},finalResultsArrayFailure=[];


  for(let buildNumber in aggrResults){
    for(let testCase in aggrResults[buildNumber]){
      if(aggrResults[buildNumber][testCase].success){
        if(!finalResultsSuccess.hasOwnProperty(testCase)){
          finalResultsSuccess[testCase] = parseFloat(aggrResults[buildNumber][testCase].time);
        }
        else{
          finalResultsSuccess[testCase] += parseFloat(aggrResults[buildNumber][testCase].time);
        }
      }
      else{
        if(!finalResultsFailure.hasOwnProperty(testCase)){
          finalResultsFailure[testCase] = parseFloat(aggrResults[buildNumber][testCase].time);
        }
        else{
          finalResultsFailure[testCase] += parseFloat(aggrResults[buildNumber][testCase].time);
        }
      }
    }
  }

  //success array
  for(let testCase in finalResultsSuccess){
    finalResultsSuccess[testCase]/=COMMIT_LIMIT;
    finalResultsArraySuccess.push({test:testCase,time:finalResultsSuccess[testCase]});
  }

  finalResultsArraySuccess.sort(function(testcase1,testcase2){
    return testcase1.time - testcase2.time
  });

  //failure array
  for(let testCase in finalResultsFailure){
    finalResultsFailure[testCase]/=COMMIT_LIMIT;
    finalResultsArrayFailure.push({test:testCase,time:finalResultsFailure[testCase]});
  }

  finalResultsArrayFailure.sort(function(testcase1,testcase2){
    return testcase1.time - testcase2.time
  });

  fs.writeFileSync("/home/{{ ansible_user }}/test-analysis/success.json", JSON.stringify(finalResultsArraySuccess));
  fs.writeFileSync("/home/{{ ansible_user }}/test-analysis/failure.json", JSON.stringify(finalResultsArrayFailure));

  console.log(finalResultsArraySuccess,finalResultsArrayFailure);
}
