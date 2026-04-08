import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart-service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css']
})
export class CartStatusComponent implements OnInit {
  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.updateCartStatus();
  }

  updateCartStatus() {
    // Đăng ký nhận cập nhật tổng giá tiền từ CartService
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // Đăng ký nhận cập nhật tổng số lượng từ CartService
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

}
