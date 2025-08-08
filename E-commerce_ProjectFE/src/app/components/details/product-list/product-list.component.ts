import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductService } from '../../../services/product';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  showModal: boolean = false;
  selectedProduct: any = null;

  showAddModal: boolean = false;
  newProduct: any = {
    productName: '',
    productCategory: '',
    productDescription: '',
    productImageURL: '',
    productPrice: 0,
    productQuantity: 0
  };
  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });

    this.http.get<any>('http://localhost:8080/products/getall', { headers }).subscribe({
      next: (response) => {
        this.products = response.data;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.cdRef.detectChanges();
      }
    });
  }

  openUpdateModal(product: any) {
    this.selectedProduct = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'Sold Out';
    if (quantity <= 15) return 'Low Stock';
    return 'In Stock';
  }

  submitUpdate() {
    if (this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct).subscribe({
        next: (response: any) => {
          Swal.fire({
            title: 'Updated',
            text: response.message,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            const index = this.products.findIndex(p => p.productId === this.selectedProduct.productId);
            if (index !== -1) {
              this.products[index] = response.data;
            }
            this.cdRef.detectChanges();
            this.closeModal();
          });
        },
        error: () => {
          Swal.fire('Error', 'Failed to update product', 'error');
        }
      });
    }
  }

  cancelEdit() {
    this.closeModal(); // Also closes the modal
  }


  openAddModal() {
    this.showAddModal = true;
    this.newProduct = {
      productName: '',
      productCategory: '',
      productDescription: '',
      productImageURL: '',
      productPrice: 0,
      productQuantity: 0
    };
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  submitNewProduct() {
    this.productService.addProduct(this.newProduct).subscribe({
      next: (response: any) => {
        Swal.fire('Success', 'Product added successfully!', 'success');
        this.products.push(response.data);
        this.closeAddModal();
        this.cdRef.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'Failed to add product.', 'error');
      }
    });
  }

  addQuantity(product: any) {
    const addAmount = 1;
    this.productService.updateQuantity(product.productId, addAmount).subscribe({
      next: (res: any) => {
        Swal.fire('Success', 'Quantity added successfully!', 'success');
        product.productQuantity += addAmount;
      },
      error: () => {
        Swal.fire('Error', 'Failed to add quantity.', 'error');
      }
    });
  }

  removeProduct(productId: number) {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to remove this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Product removed successfully.', 'success');
            this.products = this.products.filter(p => p.productId !== productId);
            this.cdRef.detectChanges();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete product.', 'error');
          }
        });
      }
    });
  }
}
