import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { environment } from '../../environments/environment.development';
import { from, map, Observable } from 'rxjs';
import { Database } from '../../types/contactTypes';
import { ContactsInterface } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class ContactsSupabaseService {

  supabase = createClient<Database>(
    environment.supabaseUrl,
    environment.supabaseKey
  )

  getContacts(): Observable<ContactsInterface[]> {
    let promise = this.supabase.from('Contacts').select('*');

    return from(promise).pipe( 
      map((response, err) => {
        return response.data ?? [];
      })
    )
  }

  createContact(name: string, email: string, phone_number: string): Observable<ContactsInterface> {
    let contactToCreate = {name, email, phone_number};
    let promise = this.supabase.from('Contacts').insert(contactToCreate).select('*').single();

    return from(promise).pipe(
      map((response, err) => {
        return response.data!;
      })
    )      
  }

  editContact(id: string, dataToUpdate: {name: string, email: string, phone_number: string, is_favourite: boolean}): Observable<void> {
    let promise = this.supabase.from('Contacts').update(dataToUpdate).match({id: id})
    return from(promise).pipe(
      map(() => {})
    )
  }

  deleteContact(id: string) {
    let promise = this.supabase.from('Contacts').delete().match({id: id});

    return from(promise).pipe(
      map((response, err) => {
        return response.data!;
      })
    )
  }

}
