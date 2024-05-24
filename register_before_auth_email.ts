
const registerBeforeAuthenticateEmail: nkruntime.BeforeHookFunction<nkruntime.AuthenticateEmailRequest> = (ctx, logger, nk, req) => {
    logger.info(`login received ${req.username} ${req.account.email} ${req.account.password}`)
    // TODO: handle something while authenticate via email
    return req;
  }