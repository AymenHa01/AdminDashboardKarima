import { Component, Inject } from '@angular/core'; // Ensure Inject is imported
import { MAT_DIALOG_DATA } from '@angular/material/dialog'; // Ensure MAT_DIALOG_DATA is imported

@Component({
  selector: 'app-images-models',
  templateUrl: './images-models.component.html',
  styleUrls: ['./images-models.component.scss']
})
export class ImagesModelsComponent {
  images : any[]=[]
   constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,



  ) {}
  ngOnInit(): void {
    console.log(this.data);
    
this.images=this.data

  }
}
