FROM node:8
MAINTAINER Ryosuke Miyamoto <miyamoto@ndinc.jp>

RUN mkdir -p /app
WORKDIR /app

COPY ./package.json /app/

RUN yarn install

COPY . /app/

EXPOSE 3000

CMD ["yarn", "start"]