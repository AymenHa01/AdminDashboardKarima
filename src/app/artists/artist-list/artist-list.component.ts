import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArtisteService } from '../../services/artiste.service';
import { MatDialog } from '@angular/material/dialog';
import { ImagesADDComponent } from '../../images-add/images-add.component';
import { BlobStorageService } from '../../services/blob-storage.service';
import { ImagesModelsComponent } from '../../images-models/images-models.component';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-artist-list',
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit {
  url: string;
  artists: any[] = [];
  file: any;
  editingId: number | null = null;
  editedArtist: any = null;
  showAddForm: boolean = false;
  
  newArtist: any = {
    id: 0,
    nom: '',
    prenom: '',
    email: '',
    numero: '',
    image: '',
    active: true
  };
  progress: number = 0;

  // Image dialog properties
  imageDialog: boolean = false;
  selectedImage: string = '';
  
  // Image edit functionality
  imageEditDialog: boolean = false;
  selectedArtistForImageEdit: any = null;
  newImageFile: File | null = null;
  imageUploadProgress: number = 0;

  // Tableau management properties
  tableauDialogVisible: boolean = false;
  selectedArtist: any = null;
  artistTableaux: any[] = [];
  newTableau: any = {
    titre: '',
    description: '',
    prix: null,
    image: '',
    artiste: null
  };
  tableauFile: any;
  
  // Edit tableau properties
  editingTableauId: number | null = null;
  editedTableau: any = null;
  editImageMode: boolean = false;

  constructor(
    private artisteService: ArtisteService,
    private router: Router,
    private dialog: MatDialog,
    private blob: BlobStorageService,
    private messageService: MessageService
  ) {
    // Initialize blob storage URL from service configuration
    this.url = environment.blobUrl
  }

  ngOnInit(): void {
    this.loadArtists();
  }

  toggleEdit(artist: any) {
    if (this.editingId === artist.id) {
      // Save changes
      this.artisteService.AddArtiste(this.editedArtist).subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Artiste mis à jour avec succès'
          });
          this.editingId = null;
          this.editedArtist = null;
          this.loadArtists();
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de la mise à jour de l\'artiste'
          });
          console.error('Erreur lors de la mise à jour:', error);
        }
      );
    } else {
      // Start editing
      this.editingId = artist.id;
      this.editedArtist = { ...artist };
    }
  }

  isEditing(artist: any): boolean {
    return this.editingId === artist.id;
  }

  cancelEdit(artist: any) {
    this.editingId = null;
    this.editedArtist = null;
  }

  DeleteArtist(id: number) {
    this.artisteService.DeleteArtiste(id).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Artiste supprimé avec succès'
        });
        this.loadArtists();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la suppression de l\'artiste'
        });
        console.error('Erreur lors de la suppression:', error);
      }
    );
  }

  saveArtist() {
    if (this.file && this.file.target && this.file.target.files) {
      this.newArtist.image = this.file.target.files[0].name;
      this.artisteService.AddArtiste(this.newArtist).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Artiste ajouté avec succès'
          });
          this.UploadImages(this.file);
          this.loadArtists();
          this.resetNewArtist();
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Erreur lors de l\'ajout de l\'artiste'
          });
          console.error('Erreur lors de l\'ajout de l\'artiste', error);
        }
      );
    }
  }

  loadArtists(): void {
    this.artisteService.GetAllArtistes().subscribe(
      (data: any) => {
        this.artists = data;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Erreur lors de la récupération des artistes'
        });
        console.error('Erreur lors de la récupération des artistes:', error);
      }
    );
  }

  resetNewArtist() {
    this.newArtist = {
      id: 0,
      nom: '',
      prenom: '',
      email: '',
      numero: '',
      image: '',
      active: true
    };
    this.file = null;
  }

  toggleActiveStatus(artist: any) {
    const updatedArtist = { ...artist, active: !artist.active };
    
    this.artisteService.AddArtiste(updatedArtist).subscribe(
      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Artist ${updatedArtist.active ? 'activated' : 'deactivated'} successfully`
        });
        this.loadArtists();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error updating artist status'
        });
        console.error('Error updating status:', error);
      }
    );
  }

  showImage(image: string) {
    this.selectedImage = this.url + '/' + image;
    this.imageDialog = true;
  }

  // Image edit functionality
  openImageEditDialog(artist: any) {
    this.selectedArtistForImageEdit = artist;
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

  updateArtistImage() {
    if (!this.newImageFile || !this.selectedArtistForImageEdit) {
      return;
    }

    const fileName = `artist_${this.selectedArtistForImageEdit.id}_${Date.now()}_${this.newImageFile.name}`;
    this.imageUploadProgress = 0;

    this.blob.uploadImage(this.newImageFile, fileName, (progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.imageUploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        
        if (this.imageUploadProgress === 100) {
          // Update the artist with the new image
          const updatedArtist = {
            ...this.selectedArtistForImageEdit,
            image: fileName
          };

          this.artisteService.AddArtiste(updatedArtist).subscribe({
            next: (response: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Artist image updated successfully'
              });
              
              this.imageEditDialog = false;
              this.resetImageEditDialog();
              this.loadArtists();
            },
            error: (error) => {
              console.error('Error updating artist image:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update artist image'
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
    this.selectedArtistForImageEdit = null;
    
    // Reset file input
    const fileInput = document.getElementById('imageEditInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
            this.openModal(this.newArtist.id);
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
        type: "A",
        id: id
      }
    });
  }

  openImages(artist: any): void {
    const dialogRef = this.dialog.open(ImagesModelsComponent, {
      width: '500px',
      height: '500px',
      data: artist.media
    });
  }

  onFileChange(event: any) {
    this.file = event;
  }

  // Tableau Management Methods
  manageTableaux(artist: any) {
    this.selectedArtist = artist;
    this.tableauDialogVisible = true;
    this.loadArtistTableaux(artist.id);
    this.resetTableauForm();
  }

  loadArtistTableaux(artistId: number) {
    this.artisteService.GetTableauxByArtiste(artistId).subscribe({
      next: (data: any) => {
        this.artistTableaux = data || [];
        console.log('Tableaux loaded:', this.artistTableaux);
      },
      error: (error) => {
        console.error('Error loading tableaux:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tableaux'
        });
        this.artistTableaux = [];
      }
    });
  }

  addTableau() {
    console.log(this.newTableau);
    
    if (!this.newTableau.titre || !this.newTableau.description || this.newTableau.prix === null || this.newTableau.prix === undefined) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields including prix'
      });
      return;
    }

    // Set the artist for the tableau
    this.newTableau.artiste = {
      id: this.selectedArtist.id
    };

    // If there's a file, upload it first (similar to atelier pattern)
    if (this.tableauFile) {
      const filename = this.tableauFile.uniqueName || this.tableauFile.name;
      this.newTableau.image = filename;
      
      this.blob.uploadImage(this.tableauFile, filename, (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          if (this.progress === 100) {
            this.submitTableau();
          }
        }
      });
    } else {
      this.submitTableau();
    }
  }

  private submitTableau() {
    console.log(this.newTableau);
    
    this.artisteService.AddTableau(this.newTableau).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tableau added successfully'
        });
        
        // Show image upload success if there was a file
        if (this.tableauFile) {
          this.messageService.add({
            severity: 'success',
            summary: 'Image Upload',
            detail: 'Image uploaded successfully to blob storage'
          });
        }
        
        this.loadArtistTableaux(this.selectedArtist.id);
        this.resetTableauForm();
        this.progress = 0; // Reset progress
      },
      error: (error) => {
        console.error('Error adding tableau:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add tableau'
        });
      }
    });
  }

  deleteTableau(tableauId: number) {
    if (confirm('Are you sure you want to delete this tableau?')) {
      this.artisteService.DeleteTableau(tableauId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Tableau deleted successfully'
          });
          this.loadArtistTableaux(this.selectedArtist.id);
        },
        error: (error) => {
          console.error('Error deleting tableau:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete tableau'
          });
        }
      });
    }
  }

  onTableauFileChange(event: any) {
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
      
      // Store the file for either new tableau or editing
      this.tableauFile = file;
      
      // Generate a unique filename for image upload
      if (this.editingTableauId !== null && this.editedTableau) {
        // For editing mode, use tableau ID in filename
        const uniqueName = `tableau_${this.editedTableau.id}_${Date.now()}_${file.name}`;
        this.tableauFile.uniqueName = uniqueName;
      } else {
        // For new tableau, use timestamp in filename
        const uniqueName = `tableau_new_${Date.now()}_${file.name}`;
        this.tableauFile.uniqueName = uniqueName;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'File Selected',
        detail: `Selected: ${file.name}`
      });
    }
  }
  
  removeTableauFile() {
    this.tableauFile = null;
    this.progress = 0;
    
    // Reset file input
    const fileInput = document.getElementById('tableauImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'File Removed',
      detail: 'Image file has been removed'
    });
  }

  resetTableauForm() {
    this.newTableau = {
      titre: '',
      description: '', // Using lowercase to match backend model
      prix: null,
      image: '',
      artiste: null
    };
    this.tableauFile = null;
    this.progress = 0;
    this.editingTableauId = null;
    this.editedTableau = null;
    
    // Reset file input
    const fileInput = document.getElementById('tableauImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    const editFileInput = document.getElementById('tableauEditImage') as HTMLInputElement;
    if (editFileInput) {
      editFileInput.value = '';
    }
    
    // Show reset confirmation
    this.messageService.add({
      severity: 'info',
      summary: 'Form Reset',
      detail: 'Tableau form has been reset'
    });
  }
  
  // Edit tableau methods
  toggleTableauEdit(tableau: any) {
    if (this.editingTableauId === tableau.id) {
      // Check if there's a new image file to upload
      if (this.tableauFile) {
        // First upload the image
        const filename = this.tableauFile.uniqueName || this.tableauFile.name;
        this.editedTableau.image = filename;
        
        this.blob.uploadImage(this.tableauFile, filename, (progressEvent: ProgressEvent) => {
          if (progressEvent.lengthComputable) {
            this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            if (this.progress === 100) {
              // After image upload is complete, save the tableau data
              this.saveTableauChanges();
            }
          }
        });
      } else {
        // No new image, just save the changes
        this.saveTableauChanges();
      }
    } else {
      // Start editing
      this.editingTableauId = tableau.id;
      this.editedTableau = { ...tableau };
      // Make sure description field uses lowercase name to match backend model
      if (this.editedTableau.Description && !this.editedTableau.description) {
        this.editedTableau.description = this.editedTableau.Description;
        delete this.editedTableau.Description;
      }
      // Reset any previously selected image
      this.tableauFile = null;
      this.progress = 0;
      
      // Reset file input for edit
      const fileInput = document.getElementById('tableauEditImage') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }
  
  // Save tableau changes to API
  private saveTableauChanges() {
    console.log(this.editedTableau);
    
    this.artisteService.EditTableau(this.editedTableau).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tableau updated successfully'
        });
        this.editingTableauId = null;
        this.editedTableau = null;
        this.tableauFile = null;
        this.progress = 0;
        this.loadArtistTableaux(this.selectedArtist.id);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update tableau'
        });
        console.error('Error updating tableau:', error);
      }
    });
  }
  
  isEditingTableau(tableau: any): boolean {
    return this.editingTableauId === tableau.id;
  }
  
  cancelTableauEdit() {
    this.editingTableauId = null;
    this.editedTableau = null;
  }
}
