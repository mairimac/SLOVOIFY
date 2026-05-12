import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const clientId = "YOUR_CLIENT_ID";
const redirectUri = "http://127.0.0.1:5173"; // No "localhost"!

export const sdk = SpotifyApi.withUserAuthorization(
  clientId, 
  redirectUri, 
  ["streaming", "user-read-playback-state", "user-modify-playback-state"]
);