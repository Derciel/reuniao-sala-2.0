import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import dotenv from 'dotenv';

dotenv.config();

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

export async function getGraphClient() {
  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: [process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default'],
  });

  return Client.init({
    authProvider: (done) => done(null, tokenResponse.accessToken),
  });
}
