FROM node:11-stretch-slim

WORKDIR /pkgs

ADD package.json /pkgs/

RUN ls
