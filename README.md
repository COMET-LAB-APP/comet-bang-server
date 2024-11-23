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



# Game Play timeout action: 

  TimeOut 
  * Effect phase timeout
    - random action before next phase 
  * Draw phase timeout
    - random action before next phase 
  * Main phase 
    - if skip Main phase with timeout
    - then set state Endphase 

  * Attack phase 
    - random action before next phase 
    - know target player A and player B , got hit and next phase to player A 

  * Second phase 
    - cannot use acttack 
    - if timeout send setState endphase to server 
  * Endphase 
    - if player should discard equal true
    - then random discard 
    - next turn

## To run Ngrok server using port 7350
```
ngrok http 7350
```
