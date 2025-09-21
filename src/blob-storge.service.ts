import { Injectable } from '@angular/core';
import { BlobServiceClient } from '@azure/storage-blob';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})


export class BlobStorgeService {

acountName=environment.acountName

containerName=environment.containerName

sas = environment.blobUrlSaS
constructor() { }

// public uploadImage(sas : string ,  content : Blob , name : string , handler : ()=> void  , onProgress: (progressEvent: ProgressEvent) => void){
//   const xhr = new XMLHttpRequest();
//   xhr.open('PUT' , `${sas}/${name}`)
//   xhr.setRequestHeader('x-ms-blob-type' , 'BlockBlob')
//   xhr.upload.onprogress=(event : ProgressEvent)=>{
//     if(event.lengthComputable){
//       const percentComplete = (event.loaded / event.total) * 100;
//       onProgress(event);  
//       console.log(`Upload progress: ${percentComplete}%`);
//     }
//   }
// const block = this.ContrainerClient(sas).getBlockBlobClient(name);
// block.uploadData(content , {blobHTTPHeaders : {blobContentType : content.type}}).then(()=> handler())
// }

// private ContrainerClient(sas?:string){
//   let token=""
//   if(sas){
//     token =sas ;
//   }
//   return new BlobServiceClient(`https://${this.acountName}.blob.core.windows.net?${token}`).getContainerClient(this.containerName)
// }


uploadImage( file: File, fileName: string, onProgress: (progressEvent: ProgressEvent) => void) {
  const xhr = new XMLHttpRequest();

  xhr.open('PUT', `https://${this.acountName}.blob.core.windows.net/${this.containerName}/${fileName}?${this.sas}`, true);
  xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

  xhr.upload.onprogress = (event: ProgressEvent) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      onProgress(event);  
      console.log(`Upload progress: ${percentComplete}%`);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log('Upload complete');
    } else {

      console.error('Upload failed', {
      status: xhr.status,         // HTTP status code (e.g., 404, 403, etc.)
      statusText: xhr.statusText, // HTTP status text (e.g., "Not Found", "Forbidden")
      response: xhr.responseText, // Response body from the server (if available)
    });
    
    }
  };

  xhr.onerror = () => {
    console.error('Upload error');
  };
  xhr.send(file);
}

/**
 * Get the full blob storage URL for accessing images
 * @returns The complete URL to the blob storage container
 */
getBlobStorageUrl(): string {
  return `https://${this.acountName}.blob.core.windows.net/${this.containerName}`;
}

/**
 * Get the full URL for a specific image
 * @param imageName The name of the image file
 * @returns The complete URL to access the image
 */
getImageUrl(imageName: string): string {
  return `${this.getBlobStorageUrl()}/${imageName}`;
}

}
