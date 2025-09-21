import { Directive, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from '../sidebar/sidebar.service';

@Directive({
  selector: '[appSidebarAware]'
})
export class SidebarAwareDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Add initial classes
    this.renderer.addClass(this.el.nativeElement, 'main-content');
    
    // Subscribe to sidebar state changes
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        if (collapsed) {
          this.renderer.addClass(this.el.nativeElement, 'sidebar-collapsed');
        } else {
          this.renderer.removeClass(this.el.nativeElement, 'sidebar-collapsed');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}