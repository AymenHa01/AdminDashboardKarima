import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CardModule } from 'primeng/card';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { UsersFormComponent } from './pages/users/users-form/users-form.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { CategoriesFormComponent } from './pages/categories/categories-form/categories-form.component';
import { CategoriesListComponent } from './pages/categories/categories-list/categories-list.component';
import { OrdersDetailComponent } from './pages/orders/orders-detail/orders-detail.component';
import { OrdersListComponent } from './pages/orders/orders-list/orders-list.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api'; 
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';
import { FormationListComponent } from './formations/formation-list/formation-list.component';
import { FormationFormComponent } from './formations/formation-form/formation-form.component';
import { EvenementListComponent } from './evenements/evenement-list/evenement-list.component';
import { EvenementFormComponent } from './evenements/evenement-form/evenement-form.component';
import { AtelierListComponent } from './ateliers/atelier-list/atelier-list.component';
import { AtelierFormComponent } from './ateliers/atelier-form/atelier-form.component';
import { UtilisateurListComponent } from './utilisateurs/utilisateur-list/utilisateur-list.component';
import { UtilisateurFormComponent } from './utilisateurs/utilisateur-form/utilisateur-form.component';
import { SousAtelierListComponent } from './sousAteliers/sous-atelier-list/sous-atelier-list.component';
import { SousAtelierFormComponent } from './sousAteliers/sous-atelier-form/sous-atelier-form.component';
import { ArtistListComponent } from './artists/artist-list/artist-list.component';
import { ArtistFormComponent } from './artists/artist-form/artist-form.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormationUpdateComponent } from './formations/formation-update/formation-update.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImagesModelsComponent } from './images-models/images-models.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { DialogModule } from 'primeng/dialog';
import { ImagesAddModule } from './images-add/images-add.module';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    ImagesModelsComponent,
    AppComponent,
    ShellComponent,
    SidebarComponent,
    DashboardComponent,
    OrdersComponent,
    UsersFormComponent,
    UserListComponent,
    CategoriesFormComponent,
    CategoriesListComponent,
    OrdersDetailComponent,
    OrdersListComponent,
    ProductListComponent,
    ProductFormComponent,
    FormationListComponent,
    FormationFormComponent,
    EvenementListComponent,
    EvenementFormComponent,
    AtelierListComponent,
    AtelierFormComponent,
    UtilisateurListComponent,
    UtilisateurFormComponent,
    SousAtelierListComponent,
    SousAtelierFormComponent,
    ArtistListComponent,
    ArtistFormComponent,
    FormationUpdateComponent,
    ImagesModelsComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ButtonModule,
    CardModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    InputNumberModule,
    InputSwitchModule,
    DropdownModule,
    EditorModule,
    ProgressBarModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatIconModule , 
    DialogModule,
    ImagesAddModule
  ],
  providers: [
    provideClientHydration(),
    MessageService,
    ConfirmationService,
    provideAnimationsAsync(),
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
