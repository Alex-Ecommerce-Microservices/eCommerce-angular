import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.luv2ShopApiUrl + '/products';
  private baseCategoryUrl = environment.luv2ShopApiUrl + '/product-category';

  constructor(private httpClient: HttpClient) { }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetProductResponse> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
    return this.getProductsPaginate(searchUrl);
  }



  getProductCategoryList(): Observable<ProductCategory[]> {
    return this.getCategories();
  }

  searchProductsPaginate(thePage: number, thePageSize: number, keyword: string): Observable<GetProductResponse> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}&page=${thePage}&size=${thePageSize}`;
    return this.getProductsPaginate(searchUrl);
  }



  getProduct(productId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${productId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  private getProductsPaginate(searchUrl: string): Observable<GetProductResponse> {
    return this.httpClient.get<GetProductResponse>(searchUrl);
  }


  private getCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetProductCategoryResponse>(this.baseCategoryUrl).pipe(
      map(response => response._embedded.productCategories)
    );
  }
}

interface GetProductResponse {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetProductCategoryResponse {
  _embedded: {
    productCategories: ProductCategory[];
  }
}