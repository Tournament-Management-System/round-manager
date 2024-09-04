import { default as fetch, Request } from "node-fetch";

export const respBuilder = (statusCode, body, additionalItems) => ({
  statusCode,
  body: JSON.stringify(body),
  ...additionalItems
});

export const appSyncRequestMaker = async (body) => {
  try {
    const request = new Request(process.env.APPSYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": process.env.APPSYNC_API_KEY
      },
      body: JSON.stringify(body)
    });

    const response = await fetch(request);
    const responseJson = await response.json();
    return responseJson;
  } catch (err) {
    return { errorMsg: "failed to make app sync request", errorBody: err };
  }
};