FROM node:erbium-alpine3.14

WORKDIR /usr/src/spira-dashboard

COPY . .

EXPOSE 8000

RUN npm install

ENTRYPOINT [ "yarn" ]

CMD [ "start" ]