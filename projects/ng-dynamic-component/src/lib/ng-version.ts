import { Injectable, Version, VERSION } from '@angular/core';

@Injectable({
  providedIn: 'root',
  useValue: VERSION,
})
export class NgVersion extends Version {}
