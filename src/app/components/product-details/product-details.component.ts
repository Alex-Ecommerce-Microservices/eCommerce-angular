import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart-service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  // product: Product = new Product(
  //   0,            // id
  //   '',           // sku
  //   '',           // name
  //   '',           // description
  //   0,            // unitPrice
  //   '',           // imageUrl
  //   true,         // active
  //   0,            // unitsInStock
  //   new Date(),   // dateCreated
  //   new Date()    // lastUpdated
  // );

  product!: Product;
  
  constructor(private cartService: CartService, private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log('ngOnInit--ProductDetailsComponent---');
    this.route.paramMap.subscribe(
      () => { 
        this.getProduct();
      }
    )
  }

  getProduct() {
    const hasProductId: boolean = this.route.snapshot.paramMap.has('id')!;

    if (hasProductId) {
      const productId = +this.route.snapshot.paramMap.get('id')!;
      this.productService.getProduct(productId).subscribe(
        data => {
          this.product = data;
        }
      )
    }
  }

  addToCart() {
    const theCardItem = new CartItem(this.product);
    this.cartService.addToCart(theCardItem);
  }

}
