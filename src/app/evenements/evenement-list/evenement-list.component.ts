import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService } from '../../services/evenement.service';
import { MediaService } from '../../services/media.service';
import { MatDialog } from '@angular/material/dialog';
import { ImagesADDComponent } from '../../images-add/images-add.component';
import { BlobStorageService } from '../../services/blob-storage.service';
import { MessageService } from 'primeng/api';
import { ImagesModelsComponent } from '../../images-models/images-models.component';
import { LOADIPHLPAPI } from 'dns';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-evenement-list',
  templateUrl: './evenement-list.component.html',
  styleUrls: ['./evenement-list.component.scss']
})
export class EvenementListComponent implements OnInit {
  evenements: any[] = [];
  file: any;
  editingId: number | null = null;
  editedEvenement: any = null;
  showAddForm: boolean = false;
  
  newEvenement: any = {
    id: 0,
    name: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '', 
    prix: 0,
    image: '',
    active: true
  };

  selectedFile: File | null = null;

  progress: number = 0;
  url=environment.blobUrl;
  imageDialog: boolean = false;
  selectedImage: string = '';

  // Multiple images management
  mediaDialogVisible: boolean = false;
  selectedEvenement: any = null;
  evenementMedias: any[] = [];
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};

  // Image edit functionality
imageEditDialog: boolean = false;
  selectedEvenementForImageEdit: any = null;
  newImageFile: File | null = null;
  imageUploadProgress: number = 0;

  // Image zoom functionality
  currentImageIndex: number = 0;
  totalImagesCount: number = 0;
  
  constructor(
    private evenementService: EvenementService,
    private mediaService: MediaService,
    private router: Router,
    private dialog: MatDialog,
    private blob: BlobStorageService,
    private messageService: MessageService
  ) {
    // Initialize blob storage URL from service configuration
    this.url =environment.blobUrl
  }

  ngOnInit(): void {
    this.loadEvenements();
  }

  toggleEdit(evenement: any) {
    console.log(evenement);
    if (this.editingId === evenement.id) {
     this.evenementService.AddEvenemt(this.editedEvenement).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Événement mis à jour avec succès'
          });
          this.editingId = null;
          this.editedEvenement = null;
          this.loadEvenements();
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de la mise à jour de l\'événement'
          });
          console.error('Erreur lors de la mise à jour:', error);
        }
      );
    } else {
      // Start editing
      this.editingId = evenement.id;
      this.editedEvenement = { ...evenement };
    }
  }

  isEditing(evenement: any): boolean {
    return this.editingId === evenement.id;
  }

  cancelEdit(evenement: any) {
    this.editingId = null;
    this.editedEvenement = null;
  }

  DeleteEvenement(id: number) {
    this.evenementService.DeleteEvents(id).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Événement supprimé avec succès'
        });
        this.loadEvenements();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la suppression de l\'événement'
        });
        console.error('Erreur lors de la suppression:', error);
      }
    );
  }

  saveEvenement() {
    console.log(this.selectedFile);
   
      this.evenementService.AddEvenemt(this.newEvenement).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Événement ajouté avec succès'
          });
          // this.onFileChange(this.file);
          this.loadEvenements();
          this.resetNewEvenement();
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de l\'ajout de l\'événement'
          });
          console.error('Erreur lors de l\'ajout de l\'événement', error);
        }
      );
    
  }

  loadEvenements(): void {
    this.evenementService.GetAllevents().subscribe(
      (data: any) => {
        console.log(data)
        this.evenements = data;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la récupération des événements'
        });
        console.error('Erreur lors de la récupération des événements:', error);
      }
    );
  }

  resetNewEvenement() {
    this.newEvenement = {
      id: 0,
      name: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      lieu: '',
      prix: 0,
      image: '',
      active: true
    };
    this.file = null;
  }

  toggleEvenementStatus(evenement: any): void {
    
    console.log(evenement.active);
   if (evenement.active) {
      evenement.active = true
    }else{
      evenement.active = false
    }
    console.log(evenement.active);
      this.evenementService.EditEvenement(evenement).subscribe({
        next: (data: any) => {
          console.log('Status updated successfully:', data);
          const message = evenement.active ? 'Événement activé avec succès!' : 'Événement désactivé avec succès!';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message
          });
          this.loadEvenements();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          // Revert the toggle if there's an error
          evenement.active = !evenement.active;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de la modification du statut.'
          });
        }
      });
    
  }

  // UploadImages(file: any) {
  //   console.log(file);
  //   if (file && file.target && file.target.files && file.target.files[0]) {
  //     const fileName = file.target.files[0].name;
      
  //     this.blob.uploadImage(file.target.files[0], fileName, (event: ProgressEvent) => {
  //       if (event.lengthComputable) {
  //         this.progress = Math.round(100 * event.loaded / event.total);
  //         if (this.progress === 100) {
  //           this.messageService.add({
  //             severity: 'success',
  //             summary: 'Success',
  //             detail: 'Image téléchargée avec succès'
  //           });
  //           this.openModal(this.newEvenement.id);
  //         }
  //       }
  //     });
  //   }
  // }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newEvenement.image = file.name;
      this.selectedFile = file;
      this.blob.uploadImage(file, file.name, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        }
      })
    }
  }

  openModal(id: number): void {
    const dialogRef = this.dialog.open(ImagesADDComponent, {
      width: '500px',
      height: '500px',
      data: {
        type: "E",
        id: id
      }
    });
  }

  openImages(evenement: any): void {
    const dialogRef = this.dialog.open(ImagesModelsComponent, {
      width: '500px',
      height: '500px',
      data: evenement.media
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${year}-${month}-${day}`;
  }

  showImage(image: string) {
    this.selectedImage = this.url + '/' + image;
    this.imageDialog = true;
  }

  // Multiple Images Management Methods
  manageImages(evenement: any) {
    this.selectedEvenement = evenement;
    console.log(this.selectedEvenement);
    
    this.mediaDialogVisible = true;
     this.evenementMedias = evenement.media || [];
     console.log('Evenement medias:', this.evenementMedias);
     
    this.resetMultipleImagesForm();
  }

  // loadEvenementMedias(evenementId: number) {
  //   this.mediaService.getMediaByTypeAndId('E', evenementId.toString()).subscribe({
  //     next: (data: any) => {
  //       this.evenementMedias = data || [];
  //       console.log('Evenement medias loaded:', this.evenementMedias);
  //     },
  //     error: (error) => {
  //       console.error('Error loading evenement medias:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to load images'
  //       });
  //       this.evenementMedias = [];
  //     }
  //   });
  // }

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
      const fileName = `evenement_${this.selectedEvenement.id}_${Date.now()}_${index}_${file.name}`;
      this.uploadProgress[fileName] = 0;

      this.blob.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          this.uploadProgress[fileName] = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          
          if (this.uploadProgress[fileName] === 100) {
            this.mediaService.addMediaToEvent(fileName,  this.selectedEvenement.id.toString()).subscribe({
              next: (response: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: `Image ${index + 1} uploaded successfully`
                });
                

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
      this.mediaService.deleteMediaEvent(media.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image deleted successfully'
          });
          // this.loadEvenementMedias(this.selectedEvenement.id);
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
    const fileInput = document.getElementById('multipleImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getUploadProgressKeys(): string[] {
    return Object.keys(this.uploadProgress);
  }

  // Image edit functionality
  openImageEditDialog(evenement: any) {
    this.selectedEvenementForImageEdit = evenement;
    this.newImageFile = null;
    this.imageUploadProgress = 0;
    this.imageEditDialog = true;
  }

  onImageFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select a valid image file'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Please select an image smaller than 5MB'
        });
        return;
      }
      
      this.newImageFile = file;
      this.messageService.add({
        severity: 'info',
        summary: 'File Selected',
        detail: `Selected: ${file.name}`
      });
    }
  }

  updateEvenementImage() {
    if (!this.newImageFile || !this.selectedEvenementForImageEdit) {
      return;
    }

    this.imageUploadProgress = 0;

    this.blob.uploadImage(this.newImageFile, this.newImageFile.name, (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.imageUploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        
        if (this.imageUploadProgress === 100) {
          // Update the evenement with the new image
          const updatedEvenement = {
            ...this.selectedEvenementForImageEdit,
            image: this.newImageFile?.name
          };

          this.evenementService.AddEvenemt(updatedEvenement).subscribe({
            next: (response: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Event image updated successfully'
              });
              
              this.imageEditDialog = false;
              this.resetImageEditDialog();
              this.loadEvenements();
            },
            error: (error) => {
              console.error('Error updating event image:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update event image'
              });
            }
          });
        }
      }
    });
  }

  resetImageEditDialog() {
    this.newImageFile = null;
    this.imageUploadProgress = 0;
    this.selectedEvenementForImageEdit = null;
    
    // Reset file input
    const fileInput = document.getElementById('imageEditInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Image zoom with navigation
  showImageInZoom(imagePath: string) {
    if (!this.selectedEvenement?.media) return;
    
    this.selectedImage = this.url + '/' + imagePath;
    this.imageDialog = true;
    
    // Find current image index
    this.currentImageIndex = this.selectedEvenement.media.findIndex((m: any) => m.path === imagePath);
    this.totalImagesCount = this.selectedEvenement.media.length;
  }

  previousImage() {
    if (this.currentImageIndex > 0 && this.selectedEvenement?.media) {
      this.currentImageIndex--;
      this.selectedImage = this.url + '/' + this.selectedEvenement.media[this.currentImageIndex].path;
    }
  }

  nextImage() {
    if (this.currentImageIndex < this.totalImagesCount - 1 && this.selectedEvenement?.media) {
      this.currentImageIndex++;
      this.selectedImage = this.url + '/' + this.selectedEvenement.media[this.currentImageIndex].path;
    }
  }

  goToImage(index: number) {
    if (this.selectedEvenement?.media && index >= 0 && index < this.totalImagesCount) {
      this.currentImageIndex = index;
      this.selectedImage = this.url + '/' + this.selectedEvenement.media[index].path;
    }
  }
}
