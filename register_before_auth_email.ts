const baseUrl = "https://6867-103-43-76-14.ngrok-free.app";
const registerBeforeAuthenticateEmail: nkruntime.BeforeHookFunction<nkruntime.AuthenticateEmailRequest> = (ctx, logger, nk, req) => {
    logger.info(`login received ${req.username} ${req.account.email} ${req.account.password}`)
    // TODO: handle something while authenticate via email
    return req;
  }

const sendVerificationEmailFn: nkruntime.AfterHookFunction<nkruntime.Session, nkruntime.AuthenticateEmailRequest> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, data: nkruntime.Session, req: nkruntime.AuthenticateEmailRequest) {
  const apiUrl = `${baseUrl}/sendVerifyEmail`
  logger.info(`login status ${data.created} received ${apiUrl} ${ctx.userId} ${req.username} ${req.account.email} ${req.account.password}`)
  if (data.created) {
    // If this is true, the account was created for the first time.
    // User Third party service to send verification email here.
    const code = generateVerificationCode(6);
    const payload = JSON.stringify({email : req.account.email ,code : code })
    const response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' }, payload);
    if (response.code > 299) {
      logger.error(`API error: ${response.body}`);
      return JSON.stringify({ error : response.body });
    }
    
    const storageObjects: nkruntime.StorageWriteRequest[] = [{
      collection: "email_verify",
      key: "authentication_email",
      value: {email : req.account.email, verify : false, code : code},
      userId: ctx.userId,
    }];
    logger.info(`login received ${storageObjects} ${code} `)
    nk.storageWrite(storageObjects);

    // const dataReponse = JSON.parse(response.body);
    // logger.info(`sendVerificationEmailFn API response: ${dataReponse}`)

    return JSON.stringify({ status : 401, message : "go to verify email" });
  } else {
    const keys: nkruntime.StorageReadRequest[] = [{
      collection: "email_verify",
      key: "authentication_email",
      userId: ctx.userId  // assuming you want to fetch data for the current user
     }];
   logger.info(`confirmVerifyEmailRpc UserId ${ctx.userId}`)
   const objects = nk.storageRead(keys);

   if (objects.length === 0) {
    logger.info(`not found`);
    return JSON.stringify({ success: false, message: "No data found." , status: 404 });
   }
   logger.info(`verify is : ${objects[0].value.verify}`);
   if (objects[0].value.verify == false){
    const code = generateVerificationCode(6);
    const storageObjects: nkruntime.StorageWriteRequest[] = [{
     collection: "email_verify",
     key: "authentication_email",
     value: {email : req.account.email, verify : false, code : code},
     userId: ctx.userId,
   }];
   const payload = JSON.stringify({email : req.account.email ,code : code })
     const response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' }, payload);
     if (response.code > 299) {
       logger.error(`API error: ${response.body}`);
       return JSON.stringify({ error : response.body });
     }
    logger.info(`login received ${storageObjects} ${code} `)
    nk.storageWrite(storageObjects);
 
   }
   
  }
};


function generateVerificationCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sendVerifyEmailRpc(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {

 
  //TODO: create base Url to config 
  const apiUrl = `${baseUrl}/sendVerifyEmail`
  logger.info(`login received ${apiUrl}`)
    let req = JSON.parse(payload);
    const code = generateVerificationCode(6);
    const newpayload = JSON.stringify({email : req.email , code : code })
    const response = nk.httpRequest(apiUrl, 'post', { 'content-type': 'application/json' },newpayload);
    if (response.code > 299) {
      logger.error(`API error: ${response.body}`);
      return JSON.stringify({ error : response.body });
    }
  
    const dataReponse = JSON.parse(response.body);
    logger.info(`data API response: ${dataReponse}`)

    return  JSON.stringify({ message : "send successful" });
 
}

function confirmVerifyEmailRpc(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {

   let req = JSON.parse(payload);

    const keys: nkruntime.StorageReadRequest[] = [{
      collection: "email_verify",
      key: "authentication_email",
      userId: context.userId  // assuming you want to fetch data for the current user
  }];
  logger.info(`confirmVerifyEmailRpc UserId ${context.userId}`)
   const objects = nk.storageRead(keys);

   if (objects.length === 0) {
    return JSON.stringify({ success: false, message: "No data found." , status: 404 });
   }
   const storageObjects = objects[0];
   const value = storageObjects.value;
   const verifyCode = value.code; 
  if (verifyCode === req.code ) {
    storageObjects.value = {email : storageObjects.value.email, verify : true,};
    storageObjects.permissionRead = 1
    storageObjects.permissionWrite = 1
    // logger.info(`confirmVerifyEmailRpc data: ${storageObjects}`)

    nk.storageWrite([storageObjects]);
    return  JSON.stringify({ success: true , message : "Verify Successful",  status: 200 });
   } else {
    logger.info(`Verify Failed ${req.code}`)
    return  JSON.stringify({success: false , message : "Verify Failed", status: 400 });
   }

}


function checkEmailVerifyRpc(context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
  
  const keys: nkruntime.StorageReadRequest[] = [{
    collection: "email_verify",
    key: "authentication_email",
    userId: context.userId  
  }];

  const objects = nk.storageRead(keys);
  if (objects.length === 0) {
    return JSON.stringify({ isVerify: false, message: "No data found." , status: 404 });
  }

  const storageObjects = objects[0];
  if(storageObjects.value.verify === false){
    return  JSON.stringify({isVerify: false , message : "need to verify email", status: 400 });
  }else{ 
    return  JSON.stringify({isVerify: true , message : "this accounts already verify", status: 200 });
  }
}