import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// Provide a URL that can be used to download a certificate that can be used to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set


const jwtCertificate = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJBLVyOxK7V4XjMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1jY2E0Y203Yy5ldS5hdXRoMC5jb20wHhcNMjAwNTIyMTUwNjAwWhcN
MzQwMTI5MTUwNjAwWjAkMSIwIAYDVQQDExlkZXYtY2NhNGNtN2MuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz3OqsdlGbl+9gvXK
yUnaOg6z7/G8wNO5LV3zUGw0OjyEIuMdQNJ3gFwZa6B6GI1F3PAq7/qQOlvfn2DS
AVspjCrTeV4qzhKt6E97tYszRuVVVxGmyHaEkVFRSJcDpVYop6L0MQI2DHd8Uyio
mIpq8TEKVwimsBz2SCdsHmLa0hM9/N2OUXuh9wyzA1n8cUTR7izj3kDDSJfsCv/S
DgzJE0+87iqGxEjSO62qyBUBqv17a4c23ossG14MyMjpzEYCAFxGZD4lB3mcYEf7
3Zu09LtAUvMRkfn6Qpt9CFe6jphs9FJ7AoXRXA92fhixO94Le+YAcMtwGg0oAIGf
4mskBwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT0x2DEve8j
j5rNVb/gHrC0hxa19TAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AIc2qcob/HUgbTIu8TWjNdqDcJobLEf5octR4WveO1jbc6bOTK0QOZ8k83dMHKni
wlf+7HKkpDmRLS2jwLaDri9i1rIaG0vgw1FeE9L6pEHpy2sXjXWcyTXaPn/Vh/A9
mYfbFivwLu9vz3DpQ2yTsiaX1vzrXXxGJow3o9PGPJcS9ak2aTXw0yiJHrSY1ma7
f+CVxZLyGLlXlX/wbsmB5azfxWidqlzinGssf26KMgkTeJB2AVlxbl9ZF9dFVeTn
Vpl2O3fWkgl+M1dMP65AoF3rx/YiLnqD366ZBxxUO/7YUUgaywbIkb6AeaS639O0
xO6gRKbp4Om2LVNChLhPu7E=
-----END CERTIFICATE-----`

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
    logger.error('User not authorized', { error: e.message })

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
  const verifiedToken = verify(token,jwtCertificate,{algorithms:['RS256']})

  logger.info('verified token',verifiedToken)
  return  verifiedToken as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
