FROM node:16.17.0

WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . .

CMD ["npm", "run","start:dev"]
