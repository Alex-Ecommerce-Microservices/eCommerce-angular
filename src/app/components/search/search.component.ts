import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  //private searchSubject = new Subject<string>();

  constructor(private router: Router) { }

  doSearch(theKeyword: string) {
    this.router.navigateByUrl(`/search/${theKeyword}`);
  }


  ngOnInit(): void {
    // this.searchSubject.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged()
    // ).subscribe(
    //   keyword => {
    //     this.executeSearch(keyword);
    //   }
    // )
  }

  // doSearch(theKeyword: string) {
  //   //this.router.navigateByUrl(`/search/${theKeyword}`);
  //   this.searchSubject.next(theKeyword);
  // }

  // executeSearch(theKeyword: string) {
  //   if (theKeyword && theKeyword.trim().length > 0) {
  //     this.router.navigateByUrl(`/search/${theKeyword}`);
  //   } else {
  //     this.router.navigateByUrl(`/products`);
  //   }
  // }

}
