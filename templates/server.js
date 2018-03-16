var shell = require('shelljs');
var commitCount=1;
shell.cd('/home/vagrant/iTrust2-v1/');
shell.rm('-rf','1');
shell.touch(String(commitCount));
shell.exec("git add .");
shell.exec(`git commit -m "test commit B${String(commitCount)}"`);
setTimeout(function(){
	shell.cd('/home/vagrant/iTrust2-v1/');
	shell.exec("git revert HEAD");
},10000);
