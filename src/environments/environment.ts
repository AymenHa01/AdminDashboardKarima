import { blob } from "stream/consumers";

export const environment = {
  production: false,
  //apiUrl: 'https://karima-abcwa9aqengeh4g5.francecentral-01.azurewebsites.net',
  apiUrl: 'http://localhost:8086',
  blobUrlSaS: 'sp=racwdli&st=2026-02-22T16:04:39Z&se=2029-02-23T00:19:39Z&spr=https&sv=2024-11-04&sr=c&sig=y0B4KHVhaQjDrkN%2FnnZRUvFFY%2FTlVOtWECZq4Ffmb2I%3D',
  blobUrl: 'https://karimablogcontainer.blob.core.windows.net/images',
  acountName: 'karimablogcontainer',
  containerName: 'images'

};
