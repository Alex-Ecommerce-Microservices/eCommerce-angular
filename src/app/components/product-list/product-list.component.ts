import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';
import { keyframes } from '@angular/animations';
import { CartStatusComponent } from '../cart-status/cart-status.component';
import { CartService } from 'src/app/services/cart-service';
import { CartItem } from 'src/app/common/cart-item';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryName: string = "";

  currentCategoryId: number = 1;
  previousCategoryId: number = 1;

  previousKeyword: string = "";

  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  constructor(private cartService: CartService, private productService: ProductService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    console.log('ngOnInit--ProductListComponent---');
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  pageChange(thePageNumber: number) {
    console.log('pageChange')
    this.thePageNumber = thePageNumber;
    this.listProducts();
  }

  listProducts() {
    console.log('listProducts')
    // check if 'name' parameter is available
    const searchMode: boolean = this.route.snapshot.paramMap.has('keyword');

    if (searchMode) {
      this.handleSearchModePaginate();
    }
    else {
      this.handleListProductPaginate();
    }
  }


  handleListProductPaginate() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
      this.currentCategoryName = "Books";
    }

    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;

    }
    this.previousCategoryId = this.currentCategoryId;
    // now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(this.processResult())
  }


  handleSearchModePaginate() {
    const theKeword: string = this.route.snapshot.paramMap.get('keyword')!;
    if (this.previousKeyword != theKeword) {
      this.thePageNumber = 1;
      this.previousKeyword = theKeword;
    }

    this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeword).subscribe(this.processResult());
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements
    }
  }

  updatePageSize(thePageSize: string) {
    this.thePageSize = +thePageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCard(theProduct: Product) {
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
}
