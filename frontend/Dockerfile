FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retries 5 \
    && npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
