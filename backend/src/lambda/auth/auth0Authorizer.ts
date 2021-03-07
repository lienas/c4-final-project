import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

import {verify, decode} from 'jsonwebtoken'
import {createLogger} from '../../utils/logger'
//import Axios from 'axios'
import {Jwt} from '../../auth/Jwt'
import {JwtPayload} from '../../auth/JwtPayload'

const logger = createLogger('auth')

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-osde.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        logger.info('User was authorized', jwtToken)

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', {error: e.message})

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, {complete: true}) as Jwt

    logger.info('Verifying token', {'token': token, 'Jwt': JSON.stringify(jwt)})

    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

    if (!authHeader)
        throw new Error('No authorization Token provided')

    if (!authHeader.toLowerCase().startsWith('bearer'))
        throw new Error('Invalid authentication header')

    // fetch the secret
    logger.info('fetching Certificate')
    let certificate = await getSigningKey(jwt.header.kid)
    certificate = `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----\n`
    logger.info('Received Certificate', {'cert': certificate})

    return verify(token, certificate, {algorithms: ['RS256']}) as JwtPayload

}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}

async function getSigningKey(kid: String): Promise<string> {

    const signingKey = 'MIIDBTCCAe2gAwIBAgIJGr+gihwF9jamMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNVBAMTFWRldi1vc2RlLmV1LmF1dGgwLmNv' +
        'bTAeFw0yMTAzMDYwNjQzNThaFw0zNDExMTMwNjQzNThaMCAxHjAcBgNVBAMTFWRldi1vc2RlLmV1LmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQE' +
        'BBQADggEPADCCAQoCggEBALpan1s3opACJd+LjdLDUeKTytoZeZcRPfyydJCmNOtJHHJnKiMNrN/uCOfegHaInCnYAInhsWiAo9pl/DjPOjquGX' +
        'WTkEY6oFwrYDm0aUcruH16C2Oa6XvVh/e+SAyGHAXhY8o/7hKQJeTG8rk5d+u6ijtUVKZxoWbwArXWflItUZa50cnwJJd6Eg/+Ju22xREWSkm4h' +
        '6NfFWSCWAwIMMrW6tHj5zemaLbLAujH+2k1eHclS2HaWVZ4K7TNOYm3034F+ZFSbOsZVG9B68+bMuzv0RBjMr+PCm9n+PE+IDM5VtZck0WEs2ci' +
        'f3232OVTr9DT/moj9K+SQt8PU+zTZgMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUZx5gCTpFk00YYvWvnmODrfRNvgowDgY' +
        'DVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCcizEW1cBejcoDmKQn4LmbJwcv2Qa3NJE14Iq6pYVg5WhviLbxXr7bef+Wmlvxaox7Az' +
        '98D3ZwtZWAxHo8x7h6pqg1wg6u0O9GnmqTXMck6IO1pVaOyhSjs4xVD74ywVz/owd7eq6F3npI0CKDw5FkHo9TRr7/C46SX3lL/PmMffgRVU5nw' +
        'Jea5fFEMr6gXOefpPCE6eAVOYz5iwIdUQLlBGYgYNoWxZ7PNCtp03cyLdDzHw0NiyrKgv/lBXhLP/H3UXm8IVgpvzO924/KtKETdsg1hTnni44N' +
        'u6yi4sP3Bl6HEq2yTV60zJDBmRg7dNsoqxIKyEnGPhbrCuwe3m8/'

    logger.info('get Signing key', {'kid': kid, 'url': jwksUrl})
    //let response = await Axios.get(jwksUrl)

    //logger.info('Received response ', {'url': jwksUrl, 'response': JSON.stringify(response)})

    // if (response.status != 200) {
    //     logger.error('Error get signing-key', {'err': JSON.stringify(response)})
    //     throw new Error(response.statusText)
    // }

    // const secret = response.data.keys.fiter(key => {
    //     key.kid = kid
    // }).x5c
    //
    // logger.info('Filtered secret from response', {'secret': secret})
    // if (!secret) {
    //     logger.error('Error fetching secret')
    //     throw new Error('Error fetching secret')
    // }

    return signingKey
}
