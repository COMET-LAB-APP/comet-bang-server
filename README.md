# SETUP PROJECT 

## set up module 
npm install
###  complie script 
 run with `npx tsc`

### run docker 
 ### If you have made changes to your module and want to re-run it, you can run:
 `docker compose up --build nakama`

or using run.sh file

### Join match for client 
 - using rpc `findMatchNew`
 - then use socket.joinMatch with MathchId 
    link: https://heroiclabs.com/docs/nakama/concepts/multiplayer/matchmaker/