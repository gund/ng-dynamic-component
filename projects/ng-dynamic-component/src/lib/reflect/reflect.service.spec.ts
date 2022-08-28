import { inject, TestBed } from '@angular/core/testing';
import { ReflectApi, ReflectRef, ReflectService } from './reflect.service';

describe('ReflectService', () => {
  class ReflectApiMock implements ReflectApi {
    getMetadata = jest.fn();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ReflectRef, useClass: ReflectApiMock }],
    });
  });

  describe('getCtorParamTypes() method', () => {
    it('should call Reflect.getMetadata() and return result', inject(
      [ReflectService, ReflectRef],
      (service: ReflectService, reflect: ReflectApiMock) => {
        reflect.getMetadata.mockReturnValue('mock-result');

        class Test {}

        const result = service.getCtorParamTypes(Test);

        expect(reflect.getMetadata).toHaveBeenCalledWith(
          'design:paramtypes',
          Test,
        );
        expect(result).toBe('mock-result');
      },
    ));
  });
});
