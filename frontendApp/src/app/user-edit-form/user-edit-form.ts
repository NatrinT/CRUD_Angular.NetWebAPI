// src/app/user/edit-user-modal/edit-user-modal.component.ts

import { Component, Output, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { UserType } from '../user/user'; 

export interface PermissionItem {
    RoleName: string;
    CanRead: boolean;
    CanWrite: boolean;
    CanDelete: boolean;
}

interface UserFormModel extends UserType {
    firstname?: string;
    lastname?: string;
    mobileNo?: string; 
    username?: string;
    password?: string;
    confirmPassword?: string;
    permissions: PermissionItem[]; 
}

@Component({
    selector: 'app-edit-user-modal',
    standalone: true, 
    imports: [CommonModule, FormsModule],
    templateUrl: './user-edit-form.html',
    styleUrls: []
})
export class EditUserModalComponent implements OnInit {

    @Output() formSubmitted = new EventEmitter<boolean>();
    
    @Input() userId!: number; 

    isLoading: boolean = true;
    userModel!: UserFormModel; 

    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7054/api/User'; 
    private pass:string|undefined = ''
    
    rolePermissions: PermissionItem[] = [ 
        { RoleName: 'Super Admin', CanRead: true, CanWrite: true, CanDelete: true },
        { RoleName: 'Admin', CanRead: true, CanWrite: false, CanDelete: false },
        { RoleName: 'HR Admin', CanRead: true, CanWrite: false, CanDelete: false },
        { RoleName: 'Employee', CanRead: true, CanWrite: false, CanDelete: false },
        { RoleName: 'Lorem Ipsum', CanRead: true, CanWrite: true, CanDelete: true },
    ];
    
    getInitialFormModel(): UserFormModel {
        return {
            id: this.userId || 0,
            fullname: '',
            email: '',
            role: 'Employee', 
            createdDate: new Date().toISOString(),
            firstname: '', 
            lastname: '', 
            mobileNo: '', 
            username: '', 
            password: '',
            confirmPassword: '',
            permissions: JSON.parse(JSON.stringify(this.rolePermissions))
        } as UserFormModel;
    }

    ngOnInit(): void {
        if (this.userId) {
            this.loadUserData(this.userId);
        } else {
            this.userModel = this.getInitialFormModel(); 
            this.isLoading = false;
        }
    }

    async loadUserData(id: number) {
        this.isLoading = true;
        try {
            const user: UserType & { mobileNo?: string,password?: string, username?: string, permissions?: PermissionItem[] } = 
                await lastValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
            
            const names = user.fullname.split(' ');
            const firstname = names.length > 0 ? names[0] : '';
            const lastname = names.length > 1 ? names.slice(1).join(' ') : ''; 
            this.pass = user.password;

            this.userModel = {
                ...user,
                firstname: firstname,
                lastname: lastname,
                permissions: (user.permissions && user.permissions.length > 0) ? 
                 user.permissions : 
                 JSON.parse(JSON.stringify(this.rolePermissions)),
                password: '', 
                confirmPassword: '',
            } as UserFormModel;

        } catch (error) {
            console.error('Failed to load user data:', error);
            alert('Failed to load user data.');
            this.userModel = this.getInitialFormModel();
        } finally {
            this.isLoading = false;
        }
    }
    
    async onSubmit() {
        if (this.userModel.password !== this.userModel.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        this.userModel.fullname = (this.userModel.firstname?.trim() || '') + ' ' + (this.userModel.lastname?.trim() || '');
        this.userModel.fullname = this.userModel.fullname.trim();

        const userToUpdate = { 
            Id: this.userModel.id,
            Fullname: this.userModel.fullname,
            Email: this.userModel.email,
            Role: this.userModel.role,
            Username: this.userModel.username,
            MobileNo: this.userModel.mobileNo,

            Password: this.userModel.password ==''?this.pass:this.userModel.password,
            
            Permissions: this.userModel.permissions.map(p => ({
                RoleName: p.RoleName, 
                CanRead: p.CanRead, 
                CanWrite: p.CanWrite, 
                CanDelete: p.CanDelete, 
            }))
        };

        try {
            const response = await lastValueFrom(this.http.put<any>(`${this.apiUrl}/${this.userModel.id}`, userToUpdate));
            
            console.log('User updated:', response);
            alert('User updated successfully!');
            
            this.formSubmitted.emit(true);

        } catch (error: any) {
    console.error('Error updating user:', error);
    
    let errorMessage = 'Failed to update user. Unknown error.';
    
    if (error.status === 400 && error.error && error.error.errors) {
        const errors = error.error.errors;
        errorMessage = 'Validation failed: ';
        for (const key in errors) {
            errorMessage += `${key}: ${errors[key][0]}; `; 
        }
    } else if (error.status === 400 && error.error) {
        errorMessage = `Bad Request: ${error.error}`;
    }

    alert(errorMessage);
}
    }

    onCancel() {
        this.formSubmitted.emit(false);
    }
}