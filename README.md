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
