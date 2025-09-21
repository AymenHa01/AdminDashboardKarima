import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  
  constructor() { }

  // Observable to track sidebar state
  get isCollapsed$(): Observable<boolean> {
    return this.isCollapsedSubject.asObservable();
  }

  // Get current sidebar state
  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  // Toggle sidebar state
  toggleSidebar(): void {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  // Set sidebar state
  setSidebarCollapsed(collapsed: boolean): void {
    this.isCollapsedSubject.next(collapsed);
  }
}