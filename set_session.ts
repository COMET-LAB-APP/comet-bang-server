let setSessionVars: nkruntime.BeforeHookFunction<nkruntime.AuthenticateEmailRequest> = function (context: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: nkruntime.AuthenticateEmailRequest) {
    payload.account.vars = {
      key: 'key',
      value: 'value',
    }
  
    return payload;
  }