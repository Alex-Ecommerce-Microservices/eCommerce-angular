import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { HttpClient } from '@angular/common/http';
import { State } from '../common/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {
  private countriesUrl = environment.luv2ShopApiUrl + "/countries";
  private statesUrl = environment.luv2ShopApiUrl + "/states";

  constructor(private httpClient: HttpClient) { }

  getCardExpirationMonth(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }

    return of(data);
  }

  getCardExpirationYear(): Observable<number[]> {
    let data: number[] = [];
    const startYear = new Date().getFullYear();
    const endYear = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }

    return of(data);
  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<CountriesResponse>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )
  }

  getStates(countryCode: number): Observable<State[]> { 
    let searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<StatesResponse>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    )
  }

}

  interface CountriesResponse {
    _embedded: {
      countries: Country[];
    }
  }
  
interface StatesResponse { 
  _embedded: {
    states: State[];
  }
}
