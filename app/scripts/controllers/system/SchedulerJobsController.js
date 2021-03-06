(function(module) {
  mifosX.controllers = _.extend(module, {
    SchedulerJobsController: function(scope, resourceFactory, route,location) {
      var jobIdArray = [];
      scope.formData={};
      resourceFactory.jobsResource.get(function(data) {
          scope.jobs = data;
      });

      resourceFactory.schedulerResource.get(function(data) {
          scope.schedulerstatus = data.active == true ? 'Active' :'Standby';
      });

      scope.selectAll = function(selectAll) {
        scope.active = selectAll;
        if(selectAll == 'true') {
          for(var i in scope.jobs) {
            jobIdArray.push(scope.jobs[i].jobId);
          }
        } else {
          for(var i in scope.jobs) {
            jobIdArray = _.without(jobIdArray,scope.jobs[i].jobId);
          }
        }
      }

      scope.selectAll =function(job){
    	
    	  this.formData.displayName=job.name;
    	  this.formData.cronExpression=job.cronExpression;
    	  this.formData.active=job.active;

          resourceFactory.jobsResource.update({jobId:job.jobId}, this.formData, function(data){
            location.path('/jobs/');
          });
        
    	  
      };
      scope.runJobSelected = function(jobId, active) {
        if(active == 'true') {
          jobIdArray.push(jobId);
        } else {
          jobIdArray = _.without(jobIdArray,jobId);
        }
      }

      scope.runSelectedJobs = function() {
        scope.sentForExecution = [];
        for(var i in jobIdArray) {
          for(var j in scope.jobs) {
            if(scope.jobs[j].jobId == jobIdArray[i]) {
              scope.sentForExecution.push(scope.jobs[j].displayName);
            }
          }
        }

        for(var i in jobIdArray) {
          resourceFactory.jobsResource.save({jobId: jobIdArray[i], command : 'executeJob'}, {}, function(data){
          });
        }
      }

      scope.suspendJobs = function() {
        resourceFactory.schedulerResource.save({command : 'stop'}, {}, function(data) {
          route.reload();
        });
      }

      scope.activeJobs = function() {
        resourceFactory.schedulerResource.save({command : 'start'}, {}, function(data) {
          route.reload();
        });
      }

      scope.refresh = function() {
        route.reload();
      }
    }
  });
  mifosX.ng.application.controller('SchedulerJobsController', ['$scope', 'ResourceFactory', '$route', '$location', mifosX.controllers.SchedulerJobsController]).run(function($log) {
    $log.info("SchedulerJobsController initialized");
  });
}(mifosX.controllers || {}));
