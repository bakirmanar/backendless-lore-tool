import { computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export function routeParamSignal<T>(
  keyOrTransform: string | ((params: Params) => T),
): Signal<T | string | null> {
  const routeParams = routeParamsSignal();

  return computed(() => {
    const params= routeParams();
    if (!params) return null;

    return typeof keyOrTransform === 'function' ? keyOrTransform(params) : params[keyOrTransform]
  });
}

export function routeParamsSignal(): Signal<Params> {
  const route = inject(ActivatedRoute);

  return toSignal(route.params, { initialValue: route.snapshot.params });
}
