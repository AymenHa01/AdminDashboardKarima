import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur/utilisateur.service';
import { MessageService } from 'primeng/api';
import { EvenementService } from '../../services/evenement.service';
import { FormationService } from '../../services/formation.service';
import { AtelierService } from '../../services/atelier.service';

interface UserWithParticipations {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  age: number;
  image: string;
  statut: boolean;
  role: string;
  expanded?: boolean;
  participations?: {
    evenements: any[];
    formations: any[];
    sousAteliers: any[];
  };
  participationTypes?: string[];
  adherents?: Array<{
    id: number;
    type: string;
    idType: number;
  }>;
  // Additional fields to help with search
  searchDetails?: {
    eventNames: string[];
    formationNames: string[];
    atelierNames: string[];
  };
}

@Component({
  selector: 'app-utilisateur-list',
  templateUrl: './utilisateur-list.component.html',
  styleUrl: './utilisateur-list.component.scss'
})
export class UtilisateurListComponent implements OnInit {
  utilisateurs: UserWithParticipations[] = [];
  filteredUtilisateurs: UserWithParticipations[] = [];
  loading: boolean = false;

  // Search and filter
  searchText: string = '';
  selectedFilterType: string = 'ALL';
  viewMode: 'table' | 'cards' = 'table';
  searchBy: string = 'user'; // Options: 'user', 'evenement', 'formation', 'atelier'

  // Specific Activity Filtering
  selectedActivityCategory: string = 'ALL'; // 'ALL', 'EVENEMENT', 'Formation', 'SousAtelier'
  selectedActivityId: number | null = null;

  allEvenements: any[] = [];
  allFormations: any[] = [];
  allSousAteliers: any[] = [];
  currentActivityOptions: any[] = [];

  // Pagination
  currentPage: number = 0;
  rowsPerPage: number = 10;
  totalRecords: number = 0;

  // Statistics
  totalEventSubscriptions: number = 0;
  totalFormationSubscriptions: number = 0;
  totalAtelierSubscriptions: number = 0;

  // Filter options
  filterOptions = [
    { label: 'All Users', value: 'ALL' },
    { label: 'Events Only', value: 'EVENEMENT' },
    { label: 'Formations Only', value: 'Formation' },
    { label: 'Ateliers Only', value: 'SousAtelier' },
    { label: 'Active Participants', value: 'ACTIVE' },
    { label: 'No Participations', value: 'NONE' }
  ];

  // Search options
  searchOptions = [
    { label: 'Search by User', value: 'user' },
    { label: 'Search by Event', value: 'evenement' },
    { label: 'Search by Formation', value: 'formation' },
    { label: 'Search by Atelier', value: 'atelier' }
  ];

  constructor(
    private utilisateurService: UtilisateurService,
    private messageService: MessageService,
    private evenementService: EvenementService,
    private formationService: FormationService,
    private atelierService: AtelierService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadAllActivities();
  }

  loadUsers() {
    this.loading = true;
    this.utilisateurService.gertAllUsers().subscribe({
      next: (data: any) => {
        this.utilisateurs = data.body || [];
        console.log("Users loaded:", this.utilisateurs);
        this.loadUserParticipations();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  loadUserParticipations() {
    this.totalEventSubscriptions = 0;
    this.totalFormationSubscriptions = 0;
    this.totalAtelierSubscriptions = 0;

    const participationPromises = this.utilisateurs.map(user =>
      this.utilisateurService.getUserParticipations(user.id).toPromise()
        .then((response: any) => {
          user.participations = {
            evenements: response.evenements || [],
            formations: response.formations || [],
            sousAteliers: response.sousAteliers || []
          };

          // Update global subscription counts
          this.totalEventSubscriptions += user.participations.evenements.length;
          this.totalFormationSubscriptions += user.participations.formations.length;
          this.totalAtelierSubscriptions += user.participations.sousAteliers.length;

          // Determine participation types for filtering
          user.participationTypes = [];
          if (user.participations.evenements.length > 0) user.participationTypes.push('EVENEMENT');
          if (user.participations.formations.length > 0) user.participationTypes.push('Formation');
          if (user.participations.sousAteliers.length > 0) user.participationTypes.push('SousAtelier');

          // Extract participation names for search functionality
          user.searchDetails = {
            eventNames: user.participations.evenements.map(event =>
              (event.nom || event.title || '').toLowerCase()
            ),
            formationNames: user.participations.formations.map(formation =>
              (formation.nom || formation.title || '').toLowerCase()
            ),
            atelierNames: user.participations.sousAteliers.map(atelier =>
              (atelier.nom || atelier.name || '').toLowerCase()
            )
          };

          return user;
        })
        .catch(error => {
          console.error(`Error loading participations for user ${user.id}:`, error);
          user.participations = { evenements: [], formations: [], sousAteliers: [] };
          user.participationTypes = [];
          user.searchDetails = { eventNames: [], formationNames: [], atelierNames: [] };
          return user;
        })
    );

    Promise.all(participationPromises).then(() => {
      this.applyFilters();
      this.loading = false;
    });
  }

  loadAllActivities() {
    // Load Events
    this.evenementService.GetAllevents().subscribe((data: any) => {
      this.allEvenements = data || [];
    });

    // Load Formations
    this.formationService.getFormations().subscribe((data: any) => {
      this.allFormations = data || [];
    });

    // Load Sous-Ateliers
    this.atelierService.GetAtelier().subscribe((data: any) => {
      const ateliers = data || [];
      const allSous: any[] = [];
      ateliers.forEach((atl: any) => {
        if (atl.sousAteliers) allSous.push(...atl.sousAteliers);
      });
      this.allSousAteliers = allSous;
    });
  }

  onActivityCategoryChange() {
    this.selectedActivityId = null;
    this.updateActivityOptions();
    this.applyFilters();
  }

  updateActivityOptions() {
    switch (this.selectedActivityCategory) {
      case 'EVENEMENT':
        this.currentActivityOptions = this.allEvenements.map(e => ({ label: e.nom || e.title, value: e.id }));
        break;
      case 'Formation':
        this.currentActivityOptions = this.allFormations.map(f => ({ label: f.nom || f.title, value: f.id }));
        break;
      case 'SousAtelier':
        this.currentActivityOptions = this.allSousAteliers.map(a => ({ label: a.nom || a.name, value: a.id }));
        break;
      default:
        this.currentActivityOptions = [];
    }
  }

  onActivitySelect() {
    this.applyFilters();
  }

  clearActivityFilter() {
    this.selectedActivityCategory = 'ALL';
    this.selectedActivityId = null;
    this.currentActivityOptions = [];
    this.searchText = '';
    this.selectedFilterType = 'ALL';
    this.applyFilters();
  }

  // Search functionality
  onSearchChange() {
    this.currentPage = 0; // Reset to first page when search changes
    this.applyFilters();
  }

  // Filter functionality
  onFilterChange() {
    this.currentPage = 0; // Reset to first page when filter changes
    this.applyFilters();
  }

  // Search type functionality
  onSearchTypeChange() {
    this.searchText = ''; // Clear search when changing search type
    this.applyFilters();
  }

  // Pagination
  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
    // No need to call applyFilters as PrimeNG handles pagination internally
  }

  applyFilters() {
    let filtered = [...this.utilisateurs];

    // Apply text search based on search type
    if (this.searchText && this.searchText.trim()) {
      const searchTerm = this.searchText.toLowerCase().trim();

      switch (this.searchBy) {
        case 'user':
          filtered = filtered.filter(user =>
            user.nom?.toLowerCase().includes(searchTerm) ||
            user.prenom?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.username?.toLowerCase().includes(searchTerm)
          );
          break;

        case 'evenement':
          filtered = filtered.filter(user =>
            user.searchDetails?.eventNames.some(eventName =>
              eventName.includes(searchTerm)
            )
          );
          break;

        case 'formation':
          filtered = filtered.filter(user =>
            user.searchDetails?.formationNames.some(formationName =>
              formationName.includes(searchTerm)
            )
          );
          break;

        case 'atelier':
          filtered = filtered.filter(user =>
            user.searchDetails?.atelierNames.some(atelierName =>
              atelierName.includes(searchTerm)
            )
          );
          break;
      }
    }

    // Apply participation filter
    if (this.selectedFilterType === 'ALL') {
      // No additional filtering
    } else if (this.selectedFilterType === 'NONE') {
      filtered = filtered.filter(user =>
        !user.participationTypes || user.participationTypes.length === 0
      );
    } else if (this.selectedFilterType === 'ACTIVE') {
      filtered = filtered.filter(user =>
        user.participationTypes && user.participationTypes.length > 0
      );
    } else {
      filtered = filtered.filter(user =>
        user.participationTypes && user.participationTypes.includes(this.selectedFilterType)
      );
    }

    // Apply specific activity filter (The new feature requested)
    if (this.selectedActivityCategory !== 'ALL' && this.selectedActivityId) {
      filtered = filtered.filter(user => {
        if (!user.adherents) return false;
        return user.adherents.some(adj =>
          adj.type === this.selectedActivityCategory && adj.idType === this.selectedActivityId
        );
      });
    }

    this.filteredUtilisateurs = filtered;
    this.totalRecords = filtered.length;
  }

  // View mode
  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }

  // User actions
  toggleUserDetails(user: UserWithParticipations) {
    user.expanded = !user.expanded;
  }

  viewUserDetails(user: UserWithParticipations) {
    // Implement user details view
    console.log('View user details:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'User Details',
      detail: `Viewing details for ${user.prenom} ${user.nom}`
    });
  }

  editUser(user: UserWithParticipations) {
    // Implement user editing
    console.log('Edit user:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'Edit User',
      detail: `Editing ${user.prenom} ${user.nom}`
    });
  }

  viewAnalytics(user: UserWithParticipations) {
    // Implement analytics view
    console.log('View analytics for user:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'User Analytics',
      detail: `Viewing analytics for ${user.prenom} ${user.nom}`
    });
  }

  // Utility methods
  hasParticipations(user: UserWithParticipations): boolean {
    return !!(user.participationTypes && user.participationTypes.length > 0);
  }

  getActiveUsersCount(): number {
    return this.utilisateurs.filter(user => user.statut).length;
  }

  getUsersWithParticipationsCount(): number {
    return this.utilisateurs.filter(user => this.hasParticipations(user)).length;
  }

  getParticipationSummary(user: UserWithParticipations): string {
    if (!user.participations) return 'Loading...';

    const summary: string[] = [];
    if (user.participations.evenements.length > 0) {
      summary.push(`${user.participations.evenements.length} Event(s)`);
    }
    if (user.participations.formations.length > 0) {
      summary.push(`${user.participations.formations.length} Formation(s)`);
    }
    if (user.participations.sousAteliers.length > 0) {
      summary.push(`${user.participations.sousAteliers.length} Atelier(s)`);
    }

    return summary.length > 0 ? summary.join(', ') : 'No participations';
  }

  getSearchPlaceholder(): string {
    const option = this.searchOptions.find(opt => opt.value === this.searchBy);
    return `Search by ${option?.label || 'User'}`;
  }
}
