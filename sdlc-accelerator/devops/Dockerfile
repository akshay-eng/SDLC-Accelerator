FROM node:alpine AS node

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
ENV WATSONX_PROXY="" \
    EXTRACTTEXT_PROXY="" \
    GENERATEDIAGRAM_PROXY="" \
    CREATEITEM_PROXY="" \
    JENKINS_USR="" \
    JENKINS_PWD=""

COPY ../package*.json ./

RUN npm install -g @angular/cli

RUN npm config set fetch-retry-maxtimeout 12000000
RUN npm config set registry http://registry.npmjs.org/
RUN npm install

COPY ../ .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY nginx.proxy.conf /etc/nginx/conf.d/default.conf

# Inject endpoint values from env variables
ARG WATSONX_PROXY
ARG EXTRACTTEXT_PROXY
ARG GENERATEDIAGRAM_PROXY
ARG CREATEITEM_PROXY

RUN sed -i '/location \/watsonx_proxy {/,/}/s|proxy_pass https://[^;]*;|proxy_pass '"${WATSONX_PROXY}"';|' /etc/nginx/conf.d/default.conf
RUN sed -i '/location \/extracttext {/,/}/s|proxy_pass https://[^;]*;|proxy_pass '"${EXTRACTTEXT_PROXY}"';|' /etc/nginx/conf.d/default.conf
RUN sed -i '/location \/generateDiagram {/,/}/s|proxy_pass https://[^;]*;|proxy_pass '"${GENERATEDIAGRAM_PROXY}"';|' /etc/nginx/conf.d/default.conf
RUN sed -i '/location \/createItem {/,/}/s|proxy_pass https://[^;]*;|proxy_pass '"${CREATEITEM_PROXY}"';|' /etc/nginx/conf.d/default.conf

COPY --from=node /usr/src/app/dist/sdlcaccl/ /usr/share/nginx/html

EXPOSE 8080

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]