export const environment = {
    JENKINS_USERNAME: window["env" as any]["JENKINS_USR" as any] || "",
    JENKINS_PASSWORD: window["env" as any]["JENKINS_PWD" as any] || ""
};
