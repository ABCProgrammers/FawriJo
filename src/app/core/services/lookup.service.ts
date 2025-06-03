import { Injectable } from "@angular/core";
import { Observable, map, catchError, of, shareReplay, Subject, BehaviorSubject, Subscription, takeUntil } from "rxjs";
import { HttpService } from "./http.service";

@Injectable({ providedIn: 'root' })
export class LookupService {
  private forceRefresh = new BehaviorSubject<number | null>(null);
  private cache = new Map<string, Observable<any>>();
  constructor(private _httpService: HttpService) {
    this.forceRefresh.subscribe(lookupTypeId => {
      if (lookupTypeId !== null) {
        const key = `lookup-lookupTypeId=${lookupTypeId}&status=1001&pageSize=10000`;
        this.cache.delete(key);
      }
    })
  }
  getLookup(params: { lookupTypeId: number; status?: number; pageSize?: number }): Observable<any> {
    const queryParams = new URLSearchParams({
      lookupTypeId: params.lookupTypeId.toString(),
      status: params.status?.toString() || '1001',
      pageSize: params.pageSize?.toString() || '10000'
    }).toString();
    const key = `lookup-${queryParams}`;
    if (!this.cache.has(key)) {
      const lookup$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?${queryParams}`)
        .pipe(map((response: any) => response || []),
          catchError(() => of([])),
          shareReplay(1)
        );
      this.cache.set(key, lookup$);
    }

    return this.cache.get(key)!;
  }
  forceRefreshLookup(lookupTypeId: number): void {
    this.forceRefresh.next(lookupTypeId);
  }
}
