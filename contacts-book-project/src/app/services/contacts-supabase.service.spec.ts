import { TestBed } from '@angular/core/testing';

import { ContactsSupabaseService } from './contacts-supabase.service';

describe('ContactsSupabaseService', () => {
  let service: ContactsSupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactsSupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
