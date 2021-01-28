# reimagined-todoless

[Serverless](https://www.serverless.com/) application with AWS lambda backend and [React](https://reactjs.org) frontend.

The frontend client can be found on this [S3 website](http://marcus-reimagined-todoless.s3-website.eu-central-1.amazonaws.com)

## Project structure

### /backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

### /client

To run a client application first create and edit a `.env` file and set correct parameters.

Navigate into the client folder and creates empty environment file
```
cd client
touch .env
```

Required environment variables in `.env` file
```
REACT_APP_API_ENDPOINT=https://<your-aws-endpoint>.execute-api.us-east-1.amazonaws.com/dev
REACT_APP_AUTH0_DOMAIN=<your-auth0-app-domain>
REACT_APP_AUTH0_CLIENT_ID=<your-auth0-client-id>
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000/callback

```

Run the application with the following commands:

```
cd client
npm install
npm run start
```


#### Deploy client to S3 website

First build the client app, then upload the artifacts from the build folder.

[deploy_client.sh](./deploy_client.sh) is a shell script that creates a S3 bucket and configures it for web access.

## Postman Example Requests

[Final Project.postman_collection.json](./Final Project.postman_collection.json) contains sample requests to explore the API.

## cURL Example Requests


GET /todos - list of all todo items for the authenticated user

```
curl -X GET --location "https://o6h6p91t5g.execute-api.us-east-1.amazonaws.com/dev/todos" \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkJLeU1SSldYQW1QenlMZ25TTWM5QyJ9.eyJpc3MiOiJodHRwczovL2Rldi1jY2E0Y203Yy5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjAwZDMyMWE1MjM4ZmIwMDY5NWY2NWUyIiwiYXVkIjoiUTZkb0ZxTEk1WTBtOVhyQmYwRjJWdklDQWpNZ3hSSkgiLCJpYXQiOjE2MTE1MTczNTQsImV4cCI6MTYxMTk0OTM1NCwiYXRfaGFzaCI6InhxY1RiMHFHcENKV0M3bHVWT2JQbFEiLCJub25jZSI6Inh-ZUV2Ym5IeWNRTjZ5LWVrWDF5dFRSNEpNWjZCQTFNIn0.uoUY6xyy5mWF6SgNBuM0HHTsHPsQsb8ltwR05dkREsdjBadww5jNld4tph5AsekxrD6pG0xdULOmgpcESiopTxQ1ibCXSfbOsw2S1BWqWlo37SDOmPasirN2rhlZ1gBdNEd38ptdJq-wVuLD3QFq8cquXo8lfxulpqrJd_DCq3uhxD1qj2oEAWTd2l3-qi67ahGkSgdtnD-6LaQcXOf8WLyi0Ct1ExFyOp5wjnLSIId5shyvyku1xdcYIzAb7ZHQCRiVEj-d0jqt2fp2Nsht7vRIsmpE_AmhK_CHhVTr1SFsoOq6PQDfHHKIn3U73SW7d08WglwZq3BxkeM6HEPaJA"
```

POST /todos - creates a new todo item for the authenticated user

```
curl -X POST --location "https://o6h6p91t5g.execute-api.us-east-1.amazonaws.com/dev/todos" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkJLeU1SSldYQW1QenlMZ25TTWM5QyJ9.eyJpc3MiOiJodHRwczovL2Rldi1jY2E0Y203Yy5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjAwZDMyMWE1MjM4ZmIwMDY5NWY2NWUyIiwiYXVkIjoiUTZkb0ZxTEk1WTBtOVhyQmYwRjJWdklDQWpNZ3hSSkgiLCJpYXQiOjE2MTE1MTE1NzQsImV4cCI6MTYxMTk0MzU3NCwiYXRfaGFzaCI6InE0YWVFZzVNT1V6dmY1ZUxLMjdHWVEiLCJub25jZSI6IjM2VXJCYmtxZzd4RWIxZ05HdE5LUm9FSWtWTy1zVWlVIn0.BrUeEieoBS-kIVPjBcGkJm3_jPQhJD8qE4eL9L4CNudakvpMRliXn26tnaYh2lhth7cfkTwxLw2BRFkWfJq4gOHJ98GZlDXxYLneygWNFT86jHkYOiLhJHkbcbEP4gB7Hg5yvUK-K0qH2JPp0ymP7-NyiLkC3rlY8Rulrd23Bx-ZC8ZcTnWUFfD8ZguWyfbLDR6miFFqS8Xwz9RQaes3eJpM8gaO0s6GIqDYGLVMv_1-1LXWA4DGXTcANkEQmpSiwuztV-2JHh7wlVeC7kbkxgiUXU-hO1ZWfZdZrS-h7zVGlDP-5AyQP8rpaTnmctL29BEEtlLx-fCWauUUZUaV_A" \
    -d "{
          \"name\": \"Water flowers\",
          \"dueDate\": \"2019-06-11\"
        }"
```

## JetBrains REST 

The [todo-api.rest](./todo-api.rest) file contains example request for the TODO api. They can be run with JetBrain IDE or VSCode plugin [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

