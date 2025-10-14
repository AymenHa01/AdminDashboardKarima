import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { FormationListComponent } from './formations/formation-list/formation-list.component';
import { FormationFormComponent } from './formations/formation-form/formation-form.component';
import { FormationUpdateComponent } from './formations/formation-update/formation-update.component';
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
import { ImagesModelsComponent } from './images-models/images-models.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Custom Modules
import { ImagesAddModule } from './images-add/images-add.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    SidebarComponent,
    DashboardComponent,
    LoginComponent,
    FormationListComponent,
    FormationFormComponent,
    FormationUpdateComponent,
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
    ImagesModelsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    CardModule,
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
    DialogModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    // Custom
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
