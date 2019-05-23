/**
 *
 * @param ctx
 * @param err
 * @param costTime
 * @returns {{method, url, body, costTime: number, userAgent: string, err: *}}
 */
exports.formatError = (ctx, err, costTime = Date.now()) => {
  let method = ctx.method;
  let url = ctx.url;
  let body = ctx.request.body;
  let userAgent = ctx.header.userAgent;
  return {method, url, body, costTime, userAgent, err}
};

/**
 *
 * @param ctx
 * @param costTime
 * @returns {{method, url, body, costTime: *, response}}
 */
exports.formatRes = (ctx, costTime) => {
  let method = ctx.method;
  let url = ctx.url;
  let body = ctx.request.body;
  let response = ctx.response;
  return {method, url, body, costTime, response};
};
