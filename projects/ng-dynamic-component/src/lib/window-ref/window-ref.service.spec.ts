import { TestBed } from '@angular/core/testing';

import { WindowRefToken, WindowRefService } from './window-ref.service';

describe('Service: WindowRef', () => {
  let service: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WindowRefService,
        { provide: WindowRefToken, useValue: 'my-window' },
      ],
    });
    service = TestBed.inject(WindowRefService);
  });

  it('should have `nativeWindow` prop', () => {
    expect(service.nativeWindow).toBeDefined();
  });

  describe('`nativeWindow` prop', () => {
    it('should be the value from DI token `WINDOW_REF`', () => {
      expect(service.nativeWindow).toBe('my-window' as any);
    });
  });
});
