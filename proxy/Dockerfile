## proxy/Dockerfile

FROM node:20.12

WORKDIR /app/proxy

COPY package*.json ./

RUN npm ci

COPY . . 

CMD [ "npm", "start" ]
