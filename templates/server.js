const express = require('express');
var shell = require('shelljs');
const app = express();
const PORT = 8082;
const COMMIT_LIMIT = 3;
var commitCount=1;
app.get('/',function(req,res){
  res.send("Api endpoints => /runFuzzer , /runTestAnalysis");
});

app.get('/runFuzzer',function(req,res){
  res.send("Running tool\n");
  //to stop the build from continuing
  if(commitCount<=COMMIT_LIMIT)
  {
    shell.cd('/home/{{ ansible_user }}/iTrust2-v1/');
    shell.touch(String(commitCount));
    shell.exec("git add .");
    shell.exec(`git commit -m "test commit B${String(commitCount)}"`);
    setTimeout(function(){  //delay required as it takes time for build to start and we dont want to revert before that
      shell.cd('/home/{{ ansible_user }}/iTrust2-v1/')
      shell.exec('git reset --hard HEAD~ ');
    },30000);
    commitCount++;//keeps track of how many builds are executed
    shell.cd('/home/{{ ansible_user }}');
  }
});

app.get('/runTestAnalysis',function(req,res){
  res.send("Analyzing the test results");
});

app.listen(PORT,function(){
  console.log("App running at "+PORT);
});
