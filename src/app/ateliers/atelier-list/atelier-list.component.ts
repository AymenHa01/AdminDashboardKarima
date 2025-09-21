import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtelierService } from '../../services/atelier.service';
import { BlobStorgeService } from '../../../blob-storge.service';
import { MessageService } from 'primeng/api';
import { env } from 'process';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-atelier-list',
  templateUrl: './atelier-list.component.html',
  styleUrls: ['./atelier-list.component.scss']
})
export class AtelierListComponent implements OnInit {
  ateliers: any[] = [];
  filteredAteliers: any[] = [];
  searchText: string = '';
  selectedAtelier: any = { id: null, name: '', description: '', image: '' };
  selectedFile: File | null = null;
  progress: number = 0;
  editingRowKeys: { [key: string]: boolean } = {};
  clonedAteliers: { [key: string]: any } = {};
  uploadingImages: { [key: string]: boolean } = {};
  uploadProgress: { [key: string]: number } = {};
  url: string;
  imageDialog: boolean = false;
  selectedImage: string = '';
  constructor(
    private atelierService: AtelierService,
    private blob: BlobStorgeService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Initialize blob storage URL from service configuration
    this.url = environment.blobUrl;
  }

  ngOnInit(): void {
    this.GetAllData();
  }

  GetAllData() {
    this.atelierService.GetAtelier().subscribe((data: any) => {
      console.log(data);
      this.ateliers = data;
      this.filteredAteliers = [...this.ateliers]; // Initialize filtered list
      this.applyFilter(); // Apply current search filter if any
    });
  }
  onRowEditInit(atelier: any) {
    this.clonedAteliers[atelier.id] = { ...atelier };
    this.editingRowKeys[atelier.id] = true;
  }

  onRowEditSave(atelier: any) {
    console.log('Saving atelier:', atelier);
    
    if (atelier.name && atelier.description) {
      // Check if image is still uploading
      if (this.uploadingImages[atelier.id]) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please wait for image upload to complete'
        });
        return;
      }
      
      delete this.clonedAteliers[atelier.id];
      delete this.editingRowKeys[atelier.id];
      
      this.atelierService.UpdateAtelier(atelier).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Atelier updated successfully'
          });
          this.GetAllData();
        },
        (error) => {
          console.error('Error updating atelier:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update atelier'
          });
        }
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Name and Description are required'
      });
    }
  }

  onRowEditCancel(atelier: any, index: number, el?: any) {
    this.ateliers[index] = this.clonedAteliers[atelier.id];
    delete this.clonedAteliers[atelier.id];
    delete this.editingRowKeys[atelier.id];
    
    // Clean up upload states
    delete this.uploadingImages[atelier.id];
    delete this.uploadProgress[atelier.id];
  }

  onFileChange(event: any, atelierId: string) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      
      if (atelierId) {
        // Editing existing atelier
        this.uploadingImages[atelierId] = true;
        this.uploadProgress[atelierId] = 0;
        
        // Find the atelier being edited and update its image
        const atelierIndex = this.ateliers.findIndex(a => a.id.toString() === atelierId.toString());
        if (atelierIndex !== -1) {
          // Upload to blob storage with custom callback handling
          this.uploadImageWithCallback(file, fileName, atelierId, atelierIndex);
        }
      } else {
        // Creating new atelier
        this.selectedAtelier.image = fileName;
        this.selectedFile = file;
        
        this.uploadImageForNewAtelier(file, fileName);
      }
    }
  }

  private uploadImageWithCallback(file: File, fileName: string, atelierId: string, atelierIndex: number) {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', `https://${this.blob.acountName}.blob.core.windows.net/${this.blob.containerName}/${fileName}?${this.blob.sas}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        this.uploadProgress[atelierId] = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        // Update the atelier object with new image name
        this.ateliers[atelierIndex].image = fileName;
        this.uploadingImages[atelierId] = false;
        this.uploadProgress[atelierId] = 100;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Image uploaded successfully'
        });
        
        // Reset progress after a delay
        setTimeout(() => {
          this.uploadProgress[atelierId] = 0;
        }, 2000);
      } else {
        this.handleUploadError(atelierId, xhr);
      }
    };

    xhr.onerror = () => {
      this.handleUploadError(atelierId, xhr);
    };

    xhr.send(file);
  }

  private uploadImageForNewAtelier(file: File, fileName: string) {
    this.blob.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    });
  }

  private handleUploadError(atelierId: string, xhr: XMLHttpRequest) {
    console.error('Error uploading image:', {
      status: xhr.status,
      statusText: xhr.statusText,
      response: xhr.responseText
    });
    
    this.uploadingImages[atelierId] = false;
    this.uploadProgress[atelierId] = 0;
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to upload image'
    });
  }

  DeleteAtelier(id: number) {
    this.atelierService.DeleteAtelier(id).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Atelier deleted successfully'
        });
        this.GetAllData();
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete atelier'
        });
      }
    );
  }

  SaveAtelier() {
    if (this.selectedAtelier.name && this.selectedAtelier.description) {
      this.atelierService.addAtelier(this.selectedAtelier).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Atelier added successfully'
          });
          this.GetAllData();
          this.selectedAtelier = { id: null, name: '', description: '', image: '' };
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add atelier'
          });
        }
      );
    }
  }

  navigateToSousAteliers(atelierId: number): void {
    this.router.navigate(['/sousAteliers/' + atelierId]);
  }

  showImage(image: string) {
    this.selectedImage = this.url + '/' + image;
    this.imageDialog = true;
  }

  // Search filter methods
  onSearchChange(event: any) {
    this.searchText = event.target.value;
    this.applyFilter();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredAteliers = [...this.ateliers];
    } else {
      const searchTerm = this.searchText.toLowerCase().trim();
      this.filteredAteliers = this.ateliers.filter(atelier => 
        atelier.name && atelier.name.toLowerCase().includes(searchTerm)
      );
    }
  }
}
