import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  categories = [
    { name: 'Kirana', icon: '🏪', color: '#F59E0B' },
    { name: 'Pooja', icon: '🪔', color: '#EF4444' },
    { name: 'Shoes', icon: '👟', color: '#3B82F6' },
    { name: 'Clothing', icon: '👕', color: '#8B5CF6' },
    { name: 'Electronics', icon: '📱', color: '#06D6A0' },
    { name: 'Grocery', icon: '🛒', color: '#10B981' },
    { name: 'Stationery', icon: '📝', color: '#F97316' },
    { name: 'Pharmacy', icon: '💊', color: '#14B8A6' },
    { name: 'Bakery', icon: '🍰', color: '#EC4899' },
    { name: 'Hardware', icon: '🔧', color: '#6366F1' },
    { name: 'Cosmetics', icon: '💄', color: '#F43F5E' },
    { name: 'Furniture', icon: '🪑', color: '#84CC16' },
  ];

  features = [
    {
      icon: '🔍',
      title: 'Search Products',
      description: 'Find any product and discover which nearby shops carry it.',
    },
    {
      icon: '📍',
      title: 'Nearby Shops',
      description: 'See shops sorted by distance from your current location.',
    },
    {
      icon: '📞',
      title: 'Confirm Availability',
      description: 'Contact sellers directly to verify product availability.',
    },
    {
      icon: '🗺️',
      title: 'Get Directions',
      description: 'Navigate to the shop with one tap using Google Maps.',
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Ask our AI chatbot to help you find exactly what you need.',
    },
    {
      icon: '🏪',
      title: 'For Sellers',
      description: 'List your shop and products to reach more local customers.',
    },
  ];

  searchQuery = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Will navigate to search results in Phase 6
      console.log('Search:', this.searchQuery);
    }
  }
}
