import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { HackerNewsComponent } from './hackernews/hackernews.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    HackerNewsComponent    
  ],
  imports: [
    HttpClientModule,
    FormsModule,    
    ReactiveFormsModule,    
    RouterModule.forRoot([
      { path: '', component: HackerNewsComponent, pathMatch: 'full' },
      { path: 'hackernews', component: HackerNewsComponent },
    ]),
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
