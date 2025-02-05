import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactsSupabaseService } from './services/contacts-supabase.service';
import { ContactsInterface } from '../types/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  contacts: ContactsInterface[] = [];
  contactForm: FormGroup;
  isEditing: boolean = false;
  editingId: string | null = null;
  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private contactsService: ContactsSupabaseService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      is_favourite: [false]
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactsService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  addContact(): void {
    if (this.contactForm.valid) {
      const { name, email, phone_number } = this.contactForm.value;
      
      this.contactsService.createContact(name, email, phone_number).subscribe({
        next: (newContact) => {
          this.contacts.unshift(newContact);
          this.contactForm.reset();
        },
        error: (error) => {
          console.error('Error creating contact:', error);
        }
      });
    }
  }

  editContact(contact: ContactsInterface): void {
    this.isEditing = true;
    this.editingId = contact.id;
    this.contactForm.patchValue({
      name: contact.name,
      email: contact.email,
      phone_number: contact.phone_number,
      is_favourite: contact.is_favourite
    });
  }

  updateContact(): void {
    if (this.contactForm.valid && this.editingId) {
      const { name, email, phone_number, is_favourite } = this.contactForm.value;
      
      this.contactsService.editContact(
        this.editingId,
        { name, email, phone_number, is_favourite }
      ).subscribe({
        next: () => {
          const index = this.contacts.findIndex(c => c.id === this.editingId);
          this.contacts[index] = {
            ...this.contacts[index],
            name,
            email,
            phone_number,
            is_favourite
          };
          this.isEditing = false;
          this.editingId = null;
          this.contactForm.reset();
        },
        error: (error) => {
          console.error('Error updating contact:', error);
        }
      });
    }
  }

  deleteContact(id: string): void {
    this.contactsService.deleteContact(id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(contact => contact.id !== id);
      },
      error: (error) => {
        console.error('Error deleting contact:', error);
      }
    });
  }

  toggleFavorite(contact: ContactsInterface): void {
    const updatedData = {
      name: contact.name,
      email: contact.email,
      phone_number: contact.phone_number,
      is_favourite: !contact.is_favourite
    };

    this.contactsService.editContact(contact.id, updatedData).subscribe({
      next: () => {
        contact.is_favourite = !contact.is_favourite;
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
      }
    });
  }

  get filteredContacts(): ContactsInterface[] {
    return this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      contact.phone_number.includes(this.searchTerm)
    );
  }
}