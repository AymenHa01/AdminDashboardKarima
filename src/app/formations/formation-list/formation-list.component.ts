import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { MediaService } from '../../services/media.service';
import { Formation } from '../../Models/formation.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ImagesADDComponent } from '../../images-add/images-add.component';
import { BlobStorageService } from '../../services/blob-storage.service';
import { ImagesModelsComponent } from '../../images-models/images-models.component';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.scss']
})
export class FormationListComponent implements OnInit {
  formations: any[] = [];
  file: any;
  editingId: number | null = null;
  editedFormation: any = null;
  url = environment.blobUrl;
  imageDialog: boolean = false;
  selectedImage: string = '';
  
  // Inline image editing properties
  uploadingImages: { [key: string]: boolean } = {};

  // Multiple images management
  mediaDialogVisible: boolean = false;
  selectedFormation: any = null;
  formationMedias: any[] = [];
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  
  // Form visibility toggle
  showAddForm: boolean = false;

  newFormation: any = {
    id: 0,
    name: '',
    description: '',
    formateur: '',
    debut: '',
    fin: '',
    heures: 0,
    prix: 0,
    image: '',
    active: true
  };
  progress: number = 0;

  constructor(
    private formationService: FormationService,
    private mediaService: MediaService,
    private router: Router,
    private dialog: MatDialog,
    private blob: BlobStorageService,
    private messageService: MessageService
  ) {
    // Initialize blob storage URL from service configuration
    this.url = environment.blobUrl
  }

  ngOnInit(): void {
    this.loadFormations();
  }

  toggleEdit(formation: any) {
    if (this.editingId === formation.id) {
      // Check if image is still uploading
      if (this.uploadingImages[formation.id]) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please wait for image upload to complete'
        });
        return;
      }
      
      this.saveFormationChanges();
    } else {
      // Start editing
      this.editingId = formation.id;
      this.editedFormation = { ...formation };
      this.uploadProgress[formation.id] = 0;
    }
  }

  isEditing(formation: any): boolean {
    return this.editingId === formation.id;
  }

  cancelEdit(formation: any) {
    if (this.editingId) {
      // Reload formations to reset any changes
      this.loadFormations();
    }
    
    this.editingId = null;
    this.editedFormation = null;
  }

  DeleteFormation(id: number) {
    this.formationService.deleteFormation(id).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Formation supprimée avec succès'
        });
        this.loadFormations();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la suppression de la formation'
        });
        console.error('Erreur lors de la suppression:', error);
      }
    );
  }

  saveFormation() {
    if (this.file && this.file.target && this.file.target.files) {
      this.newFormation.image = this.file.target.files[0].name;
      this.formationService.addFormation(this.newFormation).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Formation ajoutée avec succès'
          });
          this.UploadImages(this.file);
          this.loadFormations();
          this.resetNewFormation();
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de l\'ajout de la formation'
          });
          console.error('Erreur lors de l\'ajout de la formation', error);
        }
      );
    }
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe(
      (data: Formation[]) => {
        console.log('Formations récupérées:', data);
        this.formations = data;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la récupération des formations'
        });
        console.error('Erreur lors de la récupération des formations:', error);
      }
    );
  }

  resetNewFormation() {
    this.newFormation = {
      id: 0,
      name: '',
      description: '',
      formateur: '',
      debut: '',
      fin: '',
      heures: 0,
      prix: 0,
      image: '',
      active: true
    };
    this.file = null;
  }

  UploadImages(file: any) {
    if (file && file.target && file.target.files && file.target.files[0]) {
      const fileName = file.target.files[0].name;
      
      this.blob.uploadImage(file.target.files[0], fileName, (event: ProgressEvent) => {
        if (event.lengthComputable) {
          this.progress = Math.round(100 * event.loaded / event.total);
          if (this.progress === 100) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Image téléchargée avec succès'
            });
            this.openModal(this.newFormation.id);
          }
        }
      });
    }
  }

  openModal(id: number): void {
    const dialogRef = this.dialog.open(ImagesADDComponent, {
      width: '500px',
      height: '500px',
      data: {
        type: "F",
        id: id
      }
    });
  }

  openImages(formation: any): void {
    const dialogRef = this.dialog.open(ImagesModelsComponent, {
      width: '500px',
      height: '500px',
      data: formation.media
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${year}-${month}-${day}`;
  }

  onFileChange(event: any, formationId?: string) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      
      if (formationId) {
        // Editing existing formation - upload immediately
        this.uploadingImages[formationId] = true;
        this.uploadProgress[formationId] = 0;
        
        // Find the formation being edited and update its image
        const formationIndex = this.formations.findIndex(f => f.id.toString() === formationId.toString());
        if (formationIndex !== -1) {
          // Upload to blob storage with custom callback handling
          this.uploadImageWithCallback(file, fileName, formationId, formationIndex);
        }
      } else {
        // Creating new formation
        this.newFormation.image = fileName;
        this.file = file;
        this.uploadImageForNewFormation(file, fileName);
      }
    }
  }

  private uploadImageWithCallback(file: File, fileName: string, formationId: string, formationIndex: number) {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        this.uploadProgress[formationId] = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        // Update the formation object with new image name
        this.formations[formationIndex].image = fileName;
        if (this.editedFormation && this.editedFormation.id === formationId) {
          this.editedFormation.image = fileName;
          console.log("Edited formation image updated:", this.editedFormation);
          
        }
        this.uploadingImages[formationId] = false;
        this.uploadProgress[formationId] = 100;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Image uploaded successfully'
        });
        
        // Reset progress after a delay
        setTimeout(() => {
          this.uploadProgress[formationId] = 0;
        }, 2000);
      } else {
        this.handleUploadError(formationId, xhr);
      }
    };

    xhr.onerror = () => {
      this.handleUploadError(formationId, xhr);
    };

    xhr.send(file);
  }

  private uploadImageForNewFormation(file: File, fileName: string) {
    this.progress = 0;
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Image uploaded successfully'
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload image'
        });
      }
    };

    xhr.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload image'
      });
    };

    xhr.send(file);
  }

  private handleUploadError(formationId: string, xhr: XMLHttpRequest) {
    this.uploadingImages[formationId] = false;
    this.uploadProgress[formationId] = 0;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to upload image. Status: ${xhr.status}`
    });
  }

  showImage(image: string) {
    this.selectedImage = this.url + '/' + image;
    this.imageDialog = true;
  }

  // Multiple Images Management Methods for Formations
  manageImages(formation: any) {
    this.selectedFormation = formation;
    this.mediaDialogVisible = true;
    // this.loadFormationMedias(formation.id);
    this.resetMultipleImagesForm();
  }

  loadFormationMedias(formationId: number) {
    this.mediaService.getMediaByTypeAndId('FORMATION', formationId.toString()).subscribe({
      next: (data: any) => {
        this.formationMedias = data || [];
        console.log('Formation medias loaded:', this.formationMedias);
      },
      error: (error) => {
        console.error('Error loading formation medias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load images'
        });
        this.formationMedias = [];
      }
    });
  }

  onMultipleFilesChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = files;
    
    if (files.length > 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Files Selected',
        detail: `Selected ${files.length} file(s)`
      });
    }
  }
 

  uploadMultipleImages() {
    if (this.selectedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one image'
      });
      return;
    }

    this.selectedFiles.forEach((file, index) => {
      this.uploadProgress[file.name] = 0;

      this.blob.uploadImage(file, file.name, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          this.uploadProgress[file.name] = Math.round((progressEvent.loaded / progressEvent.total) * 100);

          if (this.uploadProgress[file.name] === 100) {

            this.mediaService.addMediaFormation(file.name, this.selectedFormation.id).subscribe({
              next: (response: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: `Image ${index + 1} uploaded successfully`
                });
                
                // Reload medias after successful upload
                this.loadFormationMedias(this.selectedFormation.id);
                delete this.uploadProgress[file.name];
              },
              error: (error) => {
                console.error('Error saving media:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: `Failed to save image ${index + 1}`
                });
                delete this.uploadProgress[file.name];
              }
            });
          }
        }
      });
    });

    // Reset form after starting uploads
    this.resetMultipleImagesForm();
  }

  deleteMedia(media: any) {
    if (confirm('Are you sure you want to delete this image?')) {
      this.mediaService.deleteMedia(media.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image deleted successfully'
          });
          this.loadFormationMedias(this.selectedFormation.id);
        },
        error: (error) => {
          console.error('Error deleting media:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete image'
          });
        }
      });
    }
  }

  private resetMultipleImagesForm() {
    this.selectedFiles = [];
    this.uploadProgress = {};
    
    // Reset file input
    const fileInput = document.getElementById('multipleImagesFormation') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getUploadProgressKeys(): string[] {
    return Object.keys(this.uploadProgress);
  }

  // Image editing methods
  removeImage(formation: any) {
    if (confirm('Are you sure you want to remove this image?')) {
      formation.image = '';
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Image will be removed when you save'
      });
    }
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  // New methods for inline image editing
  saveFormationChanges() {

    console.log("edited dddddddddddddddddd", this.editedFormation);
    
    this.formationService.updateFormation(this.editedFormation).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Formation mise à jour avec succès'
        });
        this.cancelEdit(null);
        this.loadFormations();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la mise à jour de la formation'
        });
        console.error('Erreur lors de la mise à jour:', error);
      }
    );
  }

  toggleFormationStatus(formation: any): void {

    console.log('Formation before status change:', formation.active);
    
    if (formation.active) {
      formation.active = true
    }else{

      formation.active = false
    }
    console.log('Formation after status change:', formation.active);
    console.log('Formation:', formation);
   
    this.formationService.updateFormation(formation).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Formation mise à jour avec succès'
        });
        this.cancelEdit(null);
        this.loadFormations();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la mise à jour de la formation'
        });
        console.error('Erreur lors de la mise à jour:', error);
      }
    );
    }
  }

