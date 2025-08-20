/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import functions from '@google-cloud/functions-framework';

/*
  Instructions on full setup fond here:
  https://docs.google.com/document/d/19_lcn1syxQEtmz4iOq9BRNfcpu1_J3Mn5YMLA9v-Q1Y/edit?tab=t.0

  Notes:
   1) API KEY must be stored in secret manager.
      It is passed into Cloud Function using env variable.
   2) API KEY is passed in POST request via X-Api-Key header
   3) The cloudbuild.yaml can be used with Cloud Build:
       a)  It enables Secret Manager API
       b)  It creates the secret DAP_API_KEY
           - you will need to create the secret and set the value of this
             secret to your very secret value
       c)  The Project ID must be set via build substitution
           variable _PROJECT_ID
       d)  The service account name is set via build substitution variable
           _SERVICE_ACCOUNT and has roles:
         i) roles/secretmanager.secretAccessor
         ii) roles/run.invoker
*/

const API_KEY = process.env.API_KEY || '';
const DEBUG = process.env.DEBUG || false;


/**
 * Processes the authenticated POST request from the DAP API.
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @return {object} A JSON response to control call routing.
 */
async function doPost(req, res) {
  // get X-Api-Key header from request
  const headers = req.headers;

  DEBUG && console.log(headers);

  if (headers['x-api-key'] === undefined) {
    console.error('x-api-key header missing');
    return res.status(401).json({'message': 'ERROR: Unauthorized'});
  }

  if (headers['x-api-key'] != API_KEY) {
    console.error('x-api-key missmatch');
    return res.status(401).json({'message': 'ERROR: Unauthorized'});
  }

  DEBUG && console.log(req.body);

  // perform DAP Route
  const response = {'dap_route': true};

  // route to specific menu ID
  // const response = {'menu_id': 79};

  DEBUG && console.log(response);

  return res.json(response);
}

/**
 * The main entry point for the Cloud Function. It handles HTTP requests,
 * checks the method, and routes POST requests to the doPost function.
 * @param {object} req The Express request object, containing headers and body.
 * @param {object} res The Express response object used to send a reply.
 */
functions.http('doRequest', async (req, res) => {
  // check if Post request
  switch (req.method) {
    case 'POST':
      await doPost(req, res);
      break;

    default:
      return res.status(401).json({'message': 'ERROR: Unauthorized'});
  }
});

