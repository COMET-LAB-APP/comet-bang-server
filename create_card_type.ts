
// import { CardType } from './model/card_type_model';

function createCardType(ctx: nkruntime.Context, logger : nkruntime.Logger, nk: nkruntime.Nakama, payload: any )  {
    logger.info("CreatTyope Start " + payload + " wosdgjnpwer")
    let json = JSON.parse(payload);
    // cannot registerRPC with import interface from external file
    // TODO: find solution create model into nkruntime for registerRPC
    logger.info("CreatTyope  " + payload)
    let cardType: CardType = {
        id : "Id12345",
        type: json.type
    };


    return JSON.stringify(cardType);

}

interface CardType{
    id: string;
    type: string;
}