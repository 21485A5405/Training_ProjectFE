import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../../services/product';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cartservice';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  categories: string[] = [];
  isLoading: boolean = true;
  searchTextFromQuery: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,private route: ActivatedRoute) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

  ngOnInit(): void {
    this.fetchProducts();
  }
  
  filterByHeaderSearch(): void {
    const searchQuery = this.route.snapshot.queryParamMap.get('q')?.toLowerCase().trim();
    if (searchQuery) {
      this.filteredProducts = this.products.filter(product =>
        product.productName.toLowerCase().includes(searchQuery)
      );
    } else {
      this.filteredProducts = [...this.products]; 
    }
  }
  
  fetchProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products]; // Show all initially
        this.extractUniqueCategories(this.products);
        this.filterByHeaderSearch();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const min = this.minPrice != null && this.minPrice >= 0 ? this.minPrice : 0;
    const max = this.maxPrice != null && this.maxPrice > 0 ? this.maxPrice : Number.MAX_SAFE_INTEGER;
    const category = this.selectedCategory.trim().toLowerCase();

    this.filteredProducts = this.products.filter(product => {
      const matchCategory = !category || product.productCategory.toLowerCase().includes(category);
      const matchPrice = product.productPrice >= min && product.productPrice <= max;
      return matchCategory && matchPrice;
    });
  }

  addToCart(product: any): void {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to add items to your cart.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Login Now'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    this.cartService.addToCart(userId, product.productId, 1).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `${product.productName} has been added to your cart.`,
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add product to cart.'
        });
      }
    });
  }

  extractUniqueCategories(products: any[]): void {
    const uniqueSet = new Set<string>();
    for (let product of products) {
      if (product.productCategory) {
        uniqueSet.add(product.productCategory.trim());
      }
    }
    this.categories = Array.from(uniqueSet);
  }
}
