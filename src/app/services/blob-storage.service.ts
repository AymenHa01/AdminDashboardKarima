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
    const formData = new FormData();
    
    formData.append('file', file, fileName);

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

    xhr.open('POST', `${this.blobStorageUrl}/${fileName}`, true);
    xhr.send(formData);
  }

  deleteImage(fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 204) {
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

      xhr.open('DELETE', `${this.blobStorageUrl}/${fileName}`, true);
      xhr.send();
    });
  }

  getImageUrl(fileName: string): string {
    return `${this.blobStorageUrl}/${fileName}`;
  }
}
