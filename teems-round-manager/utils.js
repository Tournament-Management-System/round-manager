import { default as fetch, Request } from "node-fetch";

export const respBuilder = (statusCode, body, additionalItems) => {
  console.log(`Response: code(${statusCode})\n` + JSON.stringify(body ?? {}));
  return {
    statusCode,
    body: JSON.stringify(body),
    ...additionalItems
  };
};

export const appSyncRequestMaker = async (body) => {
  try {
    const request = new Request(process.env.APPSYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": process.env.APPSYNC_API_KEY
      },
      body: JSON.stringify(body)
    });
    console.log(`appSyncRequestMaker: request started`);

    const response = await fetch(request);
    const responseJson = await response.json();
    return responseJson;
  } catch (err) {
    console.warn("appSyncRequestMaker: failed\n" + JSON.stringify(err ?? {}));
    return { errorMsg: "failed to make app sync request", errorBody: err };
  }
};

export const tournamentMngrRequestMaker = async (path, body) => {
  try {
    const request = new Request(`https://ao99deqz5i.execute-api.us-east-1.amazonaws.com/prod/${path}`, {
      method: "POST",
      body: JSON.stringify(body)
    });
    console.log(`tournamentMngrRequestMaker: request started for path *${path}*`);

    const response = await fetch(request);
    const responseJson = await response.json();
    return responseJson;
  } catch (err) {
    console.warn("tournamentMngrRequestMaker: failed\n" + JSON.stringify(err ?? {}));
    return { errorMsg: "failed to make tournament manager request", errorBody: err };
  }
};

export const roundMngrRequestMaker = async (path, body) => {
  try {
    const request = new Request(`https://oxsta0zfij.execute-api.us-east-1.amazonaws.com/prod/${path}`, {
      method: "POST",
      body: JSON.stringify(body)
    });
    console.log(`roundMngrRequestMaker: request started for path *${path}*`);

    const response = await fetch(request);
    const responseJson = await response.json();
    return responseJson;
  } catch (e) {
    console.warn("roundMngrRequestMaker: failed\n" + JSON.stringify(e ?? {}));
    return { errorMsg: "failed to make round manager request", errorBody: e };
  }
};