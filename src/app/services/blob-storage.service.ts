import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private blobStorageUrl = environment.blobUrlSaS

  constructor() { }

  getBlobStorageUrl(): string {
    return this.blobStorageUrl;
  }

  uploadImage(file: File, fileName: string, onProgress?: (event: ProgressEvent) => void): void {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
      if (onProgress) {
        onProgress(event);
      }
    }, false);

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        console.log('Image uploaded successfully');
      } else {
        console.error('Upload failed with status:', xhr.status);
      }
    }, false);

    xhr.addEventListener('error', () => {
      console.error('Upload error');
    }, false);

    xhr.send(file);
  }

  deleteImage(fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 202 || xhr.status === 204) {
          console.log('Image deleted successfully');
          resolve();
        } else {
          console.error('Delete failed with status:', xhr.status);
          reject(new Error(`Delete failed with status: ${xhr.status}`));
        }
      }, false);

      xhr.addEventListener('error', () => {
        console.error('Delete error');
        reject(new Error('Delete error'));
      }, false);

      xhr.open('DELETE', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
      xhr.send();
    });
  }

  getImageUrl(fileName: string): string {
    return `${this.blobStorageUrl}/${fileName}`;
  }
}
