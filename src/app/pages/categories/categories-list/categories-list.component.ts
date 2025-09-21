import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent {

  constructor(private router:Router,private messageService: MessageService,private confirmationService: ConfirmationService){
    this._getCategories()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOninit():void{
  }
  deleteCategory(categoryId: string){
    this.confirmationService.confirm({
      message: 'Do u want to delete this category ?',
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
              
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
  });
    
  }
  updateCategory(categoryId: string){
    this.router.navigateByUrl(`categories/form/${categoryId}`)
  }
  private _getCategories(){

  }
}
