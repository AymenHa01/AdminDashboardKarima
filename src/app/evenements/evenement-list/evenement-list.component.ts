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

  // Search filter properties
  searchText: string = '';
  filteredEvenements: any[] = [];

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
  url = environment.blobUrl;
  imageDialog: boolean = false;
  selectedImage: string = '';

  // Multiple images management
  mediaDialogVisible: boolean = false;
  selectedEvenement: any = null;
  evenementMedias: any[] = [];
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  uploadingImages: { [key: string]: boolean } = {};

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
    this.url = environment.blobUrl
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
    // Clean up upload states
    if (evenement.id) {
      delete this.uploadingImages[evenement.id];
      delete this.uploadProgress[evenement.id];
    }
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
        this.filteredEvenements = [...this.evenements]; // Initialize filtered list
        this.applyFilter(); // Apply current search filter if any
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
    } else {
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

  onFileChange(event: any, evenementId?: number) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;

      if (evenementId) {
        // Editing existing evenement
        this.uploadingImages[evenementId] = true;
        this.uploadProgress[evenementId] = 0;

        // Find the evenement being edited and update its image
        const index = this.evenements.findIndex(e => e.id === evenementId);
        if (index !== -1) {
          this.uploadImageWithCallback(file, fileName, evenementId, index);
        }
      } else {
        // Creating new evenement
        this.newEvenement.image = fileName;
        this.selectedFile = file;
        this.blob.uploadImage(file, fileName, (progressEvent: ProgressEvent) => {
          if (progressEvent.lengthComputable) {
            this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          }
        })
      }
    }
  }

  private uploadImageWithCallback(file: File, fileName: string, evenementId: number, index: number) {
    const xhr = new XMLHttpRequest();
    // Use environment variables for blob storage config
    xhr.open('PUT', `https://${environment.acountName}.blob.core.windows.net/${environment.containerName}/${fileName}?${environment.blobUrlSaS}`, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        this.uploadProgress[evenementId] = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        // Update the evenement object with new image name
        this.evenements[index].image = fileName;
        if (this.editedEvenement && this.editedEvenement.id === evenementId) {
          this.editedEvenement.image = fileName;
        }
        this.uploadingImages[evenementId] = false;
        this.uploadProgress[evenementId] = 100;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Image uploaded successfully'
        });

        setTimeout(() => {
          this.uploadProgress[evenementId] = 0;
        }, 2000);
      } else {
        this.handleUploadError(evenementId, xhr);
      }
    };

    xhr.onerror = () => {
      this.handleUploadError(evenementId, xhr);
    };

    xhr.send(file);
  }

  private handleUploadError(evenementId: number, xhr: XMLHttpRequest) {
    console.error('Error uploading image:', xhr);
    this.uploadingImages[evenementId] = false;
    this.uploadProgress[evenementId] = 0;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to upload image'
    });
  }

  removeImage(evenement: any) {
    if (confirm('Are you sure you want to remove this image?')) {
      if (this.isEditing(evenement)) {
        this.editedEvenement.image = '';
      } else {
        evenement.image = '';
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Image Removed',
        detail: 'Image removed from view. Save to confirm deletion from record.'
      });
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
      const parent = target.parentElement;
      if (parent && !parent.querySelector('.image-error')) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error';
        errorDiv.textContent = 'Image not available';
        parent.appendChild(errorDiv);
      }
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
            this.mediaService.addMediaToEvent(fileName, this.selectedEvenement.id.toString()).subscribe({
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

  // Helper methods for media type detection
  isImage(path: string): boolean {
    if (!path) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  isVideo(path: string): boolean {
    if (!path) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    return videoExtensions.includes(extension);
  }

  getVideoMimeType(path: string): string {
    if (!path) return '';
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska'
    };
    return mimeTypes[extension] || 'video/mp4';
  }

  // Inline media upload from table
  uploadMediaInline(event: any, evenement: any) {
    const files = Array.from(event.target.files) as File[];

    if (files.length > 0) {
      this.selectedEvenement = evenement;

      files.forEach((file) => {
        this.uploadProgress[evenement.id] = 0;

        this.blob.uploadImage(file, file.name, (progressEvent: ProgressEvent) => {
          if (progressEvent.lengthComputable) {
            this.uploadProgress[evenement.id] = Math.round((progressEvent.loaded / progressEvent.total) * 100);

            if (this.uploadProgress[evenement.id] === 100) {
              this.mediaService.addMediaToEvent(file.name, evenement.id).subscribe({
                next: (response: any) => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Media uploaded successfully'
                  });

                  // Reload evenement data to update media list
                  this.loadEvenements();

                  setTimeout(() => {
                    delete this.uploadProgress[evenement.id];
                  }, 1000);
                },
                error: (error: any) => {
                  console.error('Error saving media:', error);
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save media'
                  });
                  delete this.uploadProgress[evenement.id];
                }
              });
            }
          }
        });
      });

      // Reset file input
      event.target.value = '';
    }
  }

  // Expand media view (show all media in zoom)
  expandMediaView(evenement: any) {
    this.selectedEvenement = evenement;
    if (evenement.media && evenement.media.length > 0) {
      const firstMedia = evenement.media[0];
      if (this.isImage(firstMedia.path)) {
        this.showImageInZoom(firstMedia.path, evenement);
      } else if (this.isVideo(firstMedia.path)) {
        this.showVideoInZoom(firstMedia.path, evenement);
      }
    }
  }

  // Update showImageInZoom to accept evenement parameter
  showImageInZoom(imagePath: string, evenement?: any) {
    if (evenement) {
      this.selectedEvenement = evenement;
    }

    if (!this.selectedEvenement?.media) return;

    this.selectedImage = this.url + '/' + imagePath;
    this.imageDialog = true;

    // Find current image index
    this.currentImageIndex = this.selectedEvenement.media.findIndex((m: any) => m.path === imagePath);
    this.totalImagesCount = this.selectedEvenement.media.length;
  }

  showVideoInZoom(videoPath: string, evenement?: any) {
    if (evenement) {
      this.selectedEvenement = evenement;
    }
    this.selectedImage = this.url + '/' + videoPath;
    this.imageDialog = true;

    // Find current video index
    if (this.selectedEvenement?.media) {
      this.currentImageIndex = this.selectedEvenement.media.findIndex((m: any) => m.path === videoPath);
      this.totalImagesCount = this.selectedEvenement.media.length;
    }
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
      this.filteredEvenements = [...this.evenements];
    } else {
      const searchTerm = this.searchText.toLowerCase().trim();
      this.filteredEvenements = this.evenements.filter(evenement =>
        evenement.name && evenement.name.toLowerCase().includes(searchTerm)
      );
    }
  }
}

