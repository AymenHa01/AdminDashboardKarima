import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {
  editmode=false;
  form!:FormGroup;
  isSubmitted = false;
  categories = [];

  constructor(private route:ActivatedRoute,private formBuilder:FormBuilder,private location:Location,private messageService:MessageService){

  }
}
