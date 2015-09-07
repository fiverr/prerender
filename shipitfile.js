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
      keepReleases: 10,
      shallowClone: true,
      shared: {
        dirs: [ 'node_modules', 'log', 'run' ],
      }
    },
    fiverr03: {
      servers: 'admin@fiverr03'
    },
    fiverr04: {
      servers: 'admin@fiverr04'
    }
  });

  function underRelease(cmd) {
  	return 'cd ' + shipit.config.deployTo + "/current " + ' && ' + cmd;
  }

  shipit.blTask('startAppStaging', function () {
       	shipit.remote(underRelease("./control.sh stop staging; ./control.sh start staging"));
  });

  shipit.blTask('startAppProduction', function () {
        shipit.remote(underRelease("./control.sh stop production; ./control.sh start production"));
  });

  shipit.blTask('deployStaging', function () {
       	shipit.start('startAppStaging');
  });

  shipit.blTask('deployProduction', function () {
       	shipit.start('startAppProduction');
  });

  shipit.on("cleaned", function() {
        if (shipit.environment.indexOf("staging") > -1) {
                shipit.start('deployStaging');
        } else {
		shipit.start('deployProduction');
	}
  });
};
