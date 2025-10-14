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
  formations: Formation[] = [];
  file: any;
  editingId: number | null = null;
  editedFormation: any = null;
  url = environment.blobUrl;
  imageDialog: boolean = false;
  selectedImage: string = '';
  
  // Inline image editing properties
  editImageFile: { [key: number]: File } = {};
  editImagePreview: string | null = null;
  editImageUploadProgress: { [key: number]: number } = {};

  // Multiple images management
  mediaDialogVisible: boolean = false;
  selectedFormation: any = null;
  formationMedias: any[] = [];
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};

  // Image editing
  imageEditDialog: boolean = false;
  selectedFormationForImageEdit: any = null;
  newImageFile: File | null = null;
  imageUploadProgress: number = 0;
  
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
      // Check if there's a new image to upload first
      if (this.editImageFile[formation.id]) {
        this.uploadEditImageAndSave(formation);
      } else {
        // No new image, just save the formation changes
        this.saveFormationChanges();
      }
    } else {
      // Start editing
      this.editingId = formation.id;
      this.editedFormation = { ...formation };
      this.editImagePreview = null;
      this.editImageUploadProgress[formation.id] = 0;
    }
  }

  isEditing(formation: any): boolean {
    return this.editingId === formation.id;
  }

  cancelEdit(formation: any) {
    if (this.editingId) {
      // Clean up image editing state
      delete this.editImageFile[this.editingId];
      delete this.editImageUploadProgress[this.editingId];
    }
    
    this.editingId = null;
    this.editedFormation = null;
    this.editImagePreview = null;
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

  onFileChange(event: any) {
    this.file = event;
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
      const fileName = `formation_${this.selectedFormation.id}_${Date.now()}_${index}_${file.name}`;
      this.uploadProgress[fileName] = 0;

      this.blob.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          this.uploadProgress[fileName] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          
          if (this.uploadProgress[fileName] === 100) {
    
            this.mediaService.addMediaFormation(fileName, this.selectedFormation.id).subscribe({
              next: (response: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: `Image ${index + 1} uploaded successfully`
                });
                
                // Reload medias after successful upload
                this.loadFormationMedias(this.selectedFormation.id);
                delete this.uploadProgress[fileName];
              },
              error: (error) => {
                console.error('Error saving media:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: `Failed to save image ${index + 1}`
                });
                delete this.uploadProgress[fileName];
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
  openImageEditDialog(formation: any) {
    this.selectedFormationForImageEdit = formation;
    this.imageEditDialog = true;
    this.newImageFile = null;
    this.imageUploadProgress = 0;
  }

  onImageFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newImageFile = file;
    }
  }

  updateFormationImage() {
    if (!this.newImageFile || !this.selectedFormationForImageEdit) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select an image file'
      });
      return;
    }

    const fileName = `formation_${this.selectedFormationForImageEdit.id}_${Date.now()}_${this.newImageFile.name}`;
    
    this.blob.uploadImage(this.newImageFile, fileName, (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.imageUploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        
        if (this.imageUploadProgress === 100) {
          // Update formation with new image
          const updatedFormation = { 
            ...this.selectedFormationForImageEdit, 
            image: fileName 
          };
          
          this.formationService.updateFormation(updatedFormation).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Formation image updated successfully'
              });
              this.imageEditDialog = false;
              this.loadFormations();
              this.resetImageEditDialog();
            },
            error: (error) => {
              console.error('Error updating formation image:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update formation image'
              });
            }
          });
        }
      }
    });
  }

  resetImageEditDialog() {
    this.selectedFormationForImageEdit = null;
    this.newImageFile = null;
    this.imageUploadProgress = 0;
    
    // Reset file input
    const fileInput = document.getElementById('imageEditInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // New methods for inline image editing
  onEditImageSelect(event: any, formation: any) {
    const file = event.target.files[0];
    if (file) {
      this.editImageFile[formation.id] = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.messageService.add({
        severity: 'info',
        summary: 'Image Selected',
        detail: 'New image selected. Save to apply changes.'
      });
    }
  }

  uploadEditImageAndSave(formation: any) {
    const file = this.editImageFile[formation.id];
    if (!file) {
      this.saveFormationChanges();
      return;
    }

    const fileName = `formation_${formation.id}_${Date.now()}_${file.name}`;
    this.editImageUploadProgress[formation.id] = 0;

    this.blob.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.editImageUploadProgress[formation.id] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        
        if (this.editImageUploadProgress[formation.id] === 100) {
          // Update the edited formation with new image name
          this.editedFormation.image = fileName;
          
          // Now save the formation with the new image
          this.saveFormationChanges();
        }
      }
    });
  }

  saveFormationChanges() {
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

  toggleActiveStatus(formation: any) {
    const updatedFormation = { 
      ...formation, 
      active: !formation.active 
    };
    
    this.formationService.updateFormation(updatedFormation).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Formation ${updatedFormation.active ? 'activated' : 'deactivated'} successfully`
        });
        this.loadFormations();
      },
      error: (error) => {
        console.error('Error updating formation status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update formation status'
        });
      }
    });
  }
}
