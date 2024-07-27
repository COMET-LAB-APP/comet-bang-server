FROM node:alpine As node-builder

WORKDIR /backend

COPY package*.json . 
RUN npm install

COPY tsconfig.json . 
COPY *.ts .

COPY src/enums/* ./src/enums/
COPY src/states/* ./src/states/
COPY src/const/* ./src/const/
COPY src/model/* ./src/model/

RUN npx tsc


FROM heroiclabs/nakama:3.3.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/