## Instructions
### Instructions to run on a VM

You need to set PROJECT_ID, API_KEY and WATSONX_URL as environment variables before you can execute this program:

  - `export PROJECT_ID=<IBM Cloud Project id>`
  - `export API_KEY=<IBM Cloud API Key>`
  - `export WATSONX_URL=<watsonx url>`
  
Use below command to run the program:

  - `python watsonx-proxy.py`


### Instructions to build and run on docker

  First build the docker image:

  - `docker build -t watsonx-proxy:latest .`
  
  Run the docker image:
  
  - `docker run -p 8080:80 -e PROJECT_ID=<Project id> -e API_KEY=<API Key> -e WATSONX_URL=<watsonx URL> -e TEAM_NAME=<Name of team> -e CONTACT_EMAILS=<Contact email addresses> watsonx-proxy:latest`

### Instructions to run pre-built docker image
You need to set `PROJECT_ID`, `API_KEY` and `WATSONX_URL` as environment variables before you can run this docker image:

**To run the docker image:**

Pre-built docker image is hosted at:

`quay.io/eesilab/watsonx-proxy:latest`

Use below command to run the docker image

`docker run -p 8080:80 -e PROJECT_ID=<Project id> -e API_KEY=<API Key> -e WATSONX_URL=<watsonx URL> quay.io/eesilab/watsonx-proxy:latest`

The endpoint wil be available at the uri `/watsonx_proxy`

#### Example

https://watsonx-proxy.1ehsyhj7yesr.us-east.codeengine.appdomain.cloud/watsonx_proxy

