(function(window) {
    window["env"] = window["env"] || {};
  
    // Environment variables
    window["env"]["JENKINS_USR"] = "${JENKINS_USR}";
    window["env"]["JENKINS_PWD"] = "${JENKINS_PWD}";
})(this);