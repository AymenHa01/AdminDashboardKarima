import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShellComponent } from './shared/shell/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
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
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'aa', pathMatch: 'full' },
      { path: 'aa', component: DashboardComponent },
      { path: 'ateliers', component: AtelierListComponent },
      { path: 'ateliers/form', component: AtelierFormComponent },
      { path: 'ateliers/form/:id', component: AtelierFormComponent },
      // { path: 'actualiter', component: ActualiterComponent }, // Component not found - commented out

      { path: 'sousAteliers/:id', component: SousAtelierListComponent },
      { path: 'sousAteliers/form', component: SousAtelierFormComponent },
      { path: 'sousAteliers/form/:id', component: SousAtelierFormComponent },

      { path: 'formations', component: FormationListComponent },
      { path: 'formations/form', component: FormationFormComponent },
      { path: 'formations/form/:id', component: FormationFormComponent },
      { path: 'formations/update', component: FormationUpdateComponent },

      { path: 'evenements', component: EvenementListComponent },
      { path: 'evenements/form', component: EvenementFormComponent },
      { path: 'evenements/form/:id', component: EvenementFormComponent },

      { path: 'artists', component: ArtistListComponent },
      { path: 'artists/form', component: ArtistFormComponent },
      { path: 'artists/form/:id', component: ArtistFormComponent },

      { path: 'users', component: UtilisateurListComponent },
      { path: 'users/form', component: UtilisateurFormComponent },
      { path: 'users/form/:id', component: UtilisateurFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
