// src/app/login/login.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { lastValueFrom } from 'rxjs'; 

// Interface สำหรับข้อมูลที่ใช้ล็อกอิน (ไม่มีการเปลี่ยนแปลง)
interface LoginCredentials {
  username: string;
  password: string;
}

// ⚠️ แก้ไข: เพิ่ม userId เข้าไปใน Response
interface AuthResponse {
  token: string;
  userRole: string;
  userId: number; // ⬅️ เพิ่ม userId
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrls: []
})
export class LoginComponent {
  private router = inject(Router);
  private http = inject(HttpClient); 
  private apiUrl = 'https://localhost:7054/api/Auth/Login';

  username = signal('');
  password = signal('');
  loginError = signal(false);

  async onLogin() {
    this.loginError.set(false);

    const credentials: LoginCredentials = {
      username: this.username(),
      password: this.password()
    };
    
    if (!credentials.username || !credentials.password) {
      this.loginError.set(true);
      return;
    }

    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponse>(this.apiUrl, credentials)
      );
      if (response && response.token) {
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.userRole);
        localStorage.setItem('userId', response.userId.toString()); 
        
        this.router.navigate(['/user']);
      } else {
        this.loginError.set(true);
      }

    } catch (error: any) {
      console.error('Login Failed:', error);
      if (error.status === 401 || error.status === 404) {
        alert('Login failed: Invalid credentials.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
      this.loginError.set(true);
    }
  }
}