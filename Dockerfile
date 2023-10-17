FROM node:latest

COPY . /opt/calbear

WORKDIR /opt/calbear

RUN npm install

ENTRYPOINT [ "node" ]
CMD [ "app.js" ]