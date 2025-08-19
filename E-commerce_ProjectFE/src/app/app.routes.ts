import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/user/login-page/login-page.component';
import { RegisterPageComponent } from './components/user/register-page/register-page.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { ProductDetailsComponent } from './components/home/product-details/product-details.component';
import { OrderPageComponent } from './components/user/orders-page/orders-page.component';
import { CartPageComponent } from './components/user/cart-page/cart-page.component';
import { UsersListComponent } from './components/details/users-list/users-list.component';
import { ProductListComponent } from './components/details/product-list/product-list.component';
import { OrderListComponent } from './components/details/order-list/order-list.component';
import { SalesOverviewComponent } from './components/details/sales-overview/sales-overview.component';
import { ChangePasswordComponent } from './components/profile/change-password/change-password.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';
import { Welcomecomponent } from './components/user/welcomecomponent/welcome.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [ 
  { path: '', component: ProductDetailsComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'home-page', component: ProductDetailsComponent },

  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'cart-page', component: CartPageComponent, canActivate: [AuthGuard] },
  { path: 'order-list', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'user-list', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'sales-overview', component: SalesOverviewComponent, canActivate: [AuthGuard] },
  { path: 'orders-page', component: OrderPageComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'welcome', component: Welcomecomponent, canActivate: [AuthGuard] },

  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '404' }
];

