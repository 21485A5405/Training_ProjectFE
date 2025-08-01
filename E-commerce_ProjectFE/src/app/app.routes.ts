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
import { AdminProfileComponent } from './components/profile/admin-profile/admin-profile.component';
import { UserProfileComponent } from './components/profile/user-profile/user-profile.component';
import { Welcomecomponent } from './components/user/welcomecomponent/welcome.component';

export const routes: Routes = [ 
{ path : '', component : ProductDetailsComponent },
{ path : 'login', component: LoginPageComponent },
{ path : 'register', component: RegisterPageComponent },
{ path : 'product-details', component : ProductDetailsComponent },
{ path : 'admin-dashboard', component : AdminDashboardComponent },
{ path : 'cart-page', component : CartPageComponent},
{ path : 'order-list', component : OrderListComponent },
{ path : 'product-list', component:ProductListComponent},
{ path : 'user-list', component : UsersListComponent},
{ path : 'sales-overview', component : SalesOverviewComponent },
{ path : 'orders-page', component: OrderPageComponent},
{ path : 'cart-page', component : CartPageComponent},
{ path : 'change-password', component : ChangePasswordComponent},
{ path : 'admin-profile', component:AdminProfileComponent},
{ path : 'user-profile', component : UserProfileComponent},
{ path : 'welcome', component :Welcomecomponent}
];