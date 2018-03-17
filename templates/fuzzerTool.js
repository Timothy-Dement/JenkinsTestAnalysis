var shell = require('shelljs');

shell.cd('/home/{{ ansible_user }}/FuzzerTool');
shell.exec('node fuzzer.js');

shell.cd('/home/{{ ansible_user }}/iTrust2-v1');
shell.exec("git add .");
shell.exec(`git commit -m "test commit"`);

setTimeout(function(){
	shell.cd('/home/vagrant/iTrust2-v1/');
	shell.exec("git revert HEAD");
}, 10000);
