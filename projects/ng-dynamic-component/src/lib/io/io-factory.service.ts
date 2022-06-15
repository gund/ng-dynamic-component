import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Inject,
  Injectable,
  KeyValueDiffers,
} from '@angular/core';

import { EventArgumentToken } from './event-argument';
import { IoService } from './io.service';

@Injectable()
export class IoFactoryService {
  constructor(
    private differs: KeyValueDiffers,
    // TODO: Replace ComponentFactoryResolver once new API is created
    // @see https://github.com/angular/angular/issues/44926
    // eslint-disable-next-line deprecation/deprecation
    private cfr: ComponentFactoryResolver,
    @Inject(EventArgumentToken)
    private eventArgument: string,
    private cdr: ChangeDetectorRef,
  ) {}

  create() {
    return new IoService(this.differs, this.cfr, this.eventArgument, this.cdr);
  }
}
