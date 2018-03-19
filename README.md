# Jenkins Testing and Analysis

## Coverage/Jenkins Support
This milestone required us to perform testing and analysis using our Jenkins build server from the previous milestone.

In order for Jenkins to run testing on the iTrust repository, we added the `GitHub` plugin to the iTrust job configuration as seen below:
```
scm:
  - git:
      url: file:///home/{{ ansible_user }}/iTrust2-v1
      branches:
        - fuzzer
      wipe-workspace: true
```

We used a local copy of the iTrust repository as the versions on github were being modified which were causing test failures and failing builds in our Jenkins server

In order for the Jenkins build to start automatically on commit, we had to ensure that the iTrust repository has a post-commit hook as displayed below
```
#!/bin/sh
curl http://localhost:8081/git/notifyCommit?url=file:///home/{{ ansible_user }}/iTrust2-v1
```

We also had to enable the polling of scm as part of the job configuration in order for the commit hook to register at the Jenkins url
```
triggers:
  - pollscm:
      cron: ""
```

After performing all the above steps, on every commit, the build would clone the repository, switch to the fuzzer branch and then start a build using `mvn clean test verify checkstyle:checkstyle`

After the build has executed successfully, we get the coverage information as part of the JaCoCo library. So we added the JaCoCo plugin to Jenkins and also added it to the job configuration for the iTrust repository.
```
- jacoco:
    exec-pattern: '**/**.exec'
    class-pattern: '**/classes'
    source-pattern: '**/src/main/java'
    update-build-status: false
```

** add htmlpublisher plugin info

## Automated Commit Generation - Commit fuzzer

One of the challenges that we faced was the difference between `git reset` and `git revert`.
`git reset` removes all the modifications done as per the latest commit and leaves no trace that the commit existed in the first place.
However, `git revert` makes a new commit, and adds it to the git log.
```
commit 82d77e6decff20376fe3e17feeb9cdbc7726277d
Author: Sourabh Saha <sssaha2@ncsu.edu>
Date:   Sun Mar 18 17:56:04 2018 +0000

    Revert "test commit B1"

    This reverts commit fa04fbc3094d6f145f0e28643f7fcc677c2cc5e8.

commit fa04fbc3094d6f145f0e28643f7fcc677c2cc5e8
Author: Sourabh Saha <sssaha2@ncsu.edu>
Date:   Sun Mar 18 17:55:54 2018 +0000

    test commit B1
```
The problem was that this executed the post-commit hook as well, and we were getting alternate fuzzed and not-fuzzed builds. To solve this issue, we added a commit filter, in the post-commit hook, which checks the git log to see the commit message of the latest commit, and if the commit message has  `revert` in it, it ignores the commit.
```
#!/bin/sh
if  git log -1 | grep -q 'revert' > /dev/null; then
        echo "Found revert"
else
        curl http://localhost:8081/git/notifyCommit?url=file:///home/{{ ansible_user }}/iTrust2-v1
fi
```

For the fuzzing operation, we used the following methods:
* Swapping `<` with `>`

* Swapping `!=` with `==`

* Swapping `0` with `1`

* Change content of `"strings"` in code

Our approach to fuzz the files is as follows:

* First we make a list of all the directories (containing the files that we want to fuzz)

* We then select 10 random files from the total files.

* Then for each of the files, we perform one randomly chosen fuzzing operations, from the ones described above.

* After the 10 files have been fuzzed, we try to compile the project using `mvn compile`.

* If the compilation is successfull, we go ahead and add the files to the git working tree and commit them so that the build starts automatically. Otherwise, we reset the changes and fuzz a different set of 10 files.
