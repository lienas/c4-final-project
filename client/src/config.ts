const apiId = '6ajcdngjq2'
//endpoint for online
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

//endpoint for offline
//export const apiEndpoint = `http://localhost:3003/dev`

export const authConfig = {
  domain: 'dev-osde.eu.auth0.com',            // Auth0 domain
  clientId: 'UqaOHOlknzUX0ZOU6hzY5Fwc87VBCJLZ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
