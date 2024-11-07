# extracttext

## Building the Docker image:

  - `docker build -t extracttext:latest -f devops/Dockerfile .`
  
## Runing the docker image:
  
  - `docker run -p 8080:8080 extracttext:latest`

## Instructions to run pre-built docker image

**To run the docker image:**

Pre-built docker image is hosted at:

`quay.io/eesilab/extracttext`

Use below command to run the docker image

`docker run -p 8080:80 quay.io/eesilab/extracttext`

## Endpoints
This service exposes two endpoints:

### EXTRACTTEXT_PROXY
This endpoint will be available at the uri '/extracttext'

#### Example:
https://extracttext.1es0et4q3hcc.us-east.codeengine.appdomain.cloud/extracttext
### GENERATEDIAGRAM_PROXY
This endpoint will be available at the uri '/generateDiagram'

### Example:
https://extracttext.1es0hrxs3hcc.us-east.codeengine.appdomain.cloud/generateDiagram
