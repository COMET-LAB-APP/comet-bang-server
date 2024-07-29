# Stage 1: Build the Node.js project
FROM node:alpine AS node-builder

WORKDIR /backend

COPY package*.json . 
RUN npm install

COPY tsconfig.json . 
COPY *.ts .

COPY src/enums/* ./src/enums/
COPY src/states/* ./src/states/
COPY src/const/* ./src/const/
COPY src/entities/* ./src/entities/

RUN npx tsc


FROM heroiclabs/nakama:3.22.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/