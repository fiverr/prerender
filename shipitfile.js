module.exports = function (shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/shipit_workspace',
      deployTo: '/home/admin/apps/prerender',
      repositoryUrl: 'git@github.com:fiverr/prerender.git',
      ignores: ['.git', 'node_modules'],
      branch: process.env.BRANCH || 'master',
      keepReleases: 30,
      shallowClone: true,
      shared: {
        dirs: [ 'node_modules', 'log', 'run', 'geoloc' ],
      }
    },
    stagingMaster: {
      servers: 'admin@staging-master'
    },
    staging01: {
      servers: 'admin@staging01'
    },
    staging02: {
      servers: 'admin@staging02'
    },
    staging03: {
      servers: 'admin@staging03'
    },
    staging04: {
      servers: 'admin@staging04'
    },
    aux01: {
      servers: 'admin@aux-01'
    },
    aux02: {
      servers: 'admin@aux-02'
    }
  });

  function underRelease(cmd) {
  	return 'cd ' + shipit.config.deployTo + "/current " + ' && ' + cmd;
  }

  shipit.blTask('copyAppJsFile', function () {
	var appJsFile = 'app.js';
	shipit.remoteCopy(shipit.config.workspace + "/" + appJsFile, shipit.config.deployTo + '/shared/' + appJsFile);
        shipit.remote("ln -nfs " + shipit.config.deployTo + "/shared/" + appJsFile + " " + shipit.config.deployTo + "/current/" + appJsFile);
	shipit.emit('AppJsCopied');
  });

  shipit.blTask('startAppStaging', function () {
       	shipit.remote(underRelease("./control.sh restart staging"));
  });

  shipit.blTask('startAppProduction', function () {
        shipit.remote(underRelease("./control.sh restart production"));
  });

  shipit.blTask('deployStaging', function () {
	shipit.start('copyAppJsFile');
	shipit.on("AppJsCopied", function() {
        	shipit.start('startAppStaging');
	});
  });

  shipit.blTask('deployProduction', function () {
	shipit.start('copyAppJsFile')
	shipit.on("AppJsCopied", function() {
        	shipit.start('startAppProduction');
	});
  });

  shipit.blTask('rollbackOlderThanPrevious', function () {
	var currentDir = shipit.config.deployTo + '/current';
	var releaseDir = shipit.config.deployTo + '/releases';
	var versionsBack = process.env.VERSIONS_BACK;

	shipit.remote("ls -ltr " + currentDir + " | awk -F/ '{print \"ls -ltr " + releaseDir + " | grep -v \" \\$NF}' | bash | grep -v total | awk '{print NR\" \"\\$9}' | sort -n | tail -" + versionsBack + " | head -1 | awk '{print \\$2}' | xargs -I active ln -nfs \"" + releaseDir + "/active\" \"" + currentDir + "\"");
	shipit.start('startAppStaging');
  });

  shipit.on("cleaned", function() {
        if (shipit.environment.indexOf("staging") > -1) {
                shipit.start('deployStaging');
        } else {
		shipit.start('deployProduction');
	}
  });
};
