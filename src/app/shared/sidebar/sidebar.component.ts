import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from './sidebar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkMobile();
  }

  ngOnInit(): void {
    // Subscribe to sidebar state changes
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      })
    );

    // Set initial state based on screen size
    this.checkMobile();
    if (this.isMobile) {
      this.sidebarService.setSidebarCollapsed(true);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobile();
    // Auto-collapse on mobile
    if (this.isMobile && !this.isCollapsed) {
      this.sidebarService.setSidebarCollapsed(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  logout(): void {
    // Clear authentication token
    this.authService.logout();
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
