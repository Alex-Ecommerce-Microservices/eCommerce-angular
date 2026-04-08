import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart-service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Purchase } from 'src/app/common/purchase';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardMonth: number[] = [];
  creditCardYear: number[] = [];

  countries: Country[] = [];
  shippingStates: State[] = [];
  billingStates: State[] = [];

  storage: Storage = sessionStorage;

  // Initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  isDisabled: boolean = false;



  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private luv2ShopFormService: Luv2ShopFormService,
    private checkoutService: CheckoutService) {
  }
  ngOnInit(): void {
    this.buildCheckoutForm();

    //this.getExpirationMonth();
    //this.getExpirationYear();
    this.getCountries();

    // setup Stripe payment form
    this.setupStripePaymentForm();

    
    this.reviewCartDetails();

    
  }
  setupStripePaymentForm() {

    // get a handle to stripe element
    var elements = this.stripe.elements();

    // Create a card element and hide zip code field
    this.cardElement = elements.create('card', { hidePostalcode: true });

    // Add an instance of card UI compoment into the card-element div
    this.cardElement.mount("#card-element");

    // Add event binding for the 'change' event on the card-element'
    this.cardElement.on('change', (event) => {
      // get a handle to card errors element
      this.displayError = document.getElementById("#card-errors");

      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });


  }
  getCountries() {
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    )
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === "shippingAddress") {
          this.shippingStates = data;
        } else {
          this.billingStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }

    )
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    );

    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );

    // no need this computation bcos we have Behavior Subject-get the latest value
    //this.cartService.computeCartTotals();
  }

  // getExpirationMonth() {
  //   const startMonth: number = new Date().getMonth() + 1;
  //   this.luv2ShopFormService.getCardExpirationMonth(startMonth).subscribe(
  //     data => {
  //       this.creditCardMonth = data;
  //       this.checkoutFormGroup?.get('creditCard.expirationMonth')?.setValue(data[0]);
  //     }
  //   )
  // }

  // getExpirationYear() {
  //   this.luv2ShopFormService.getCardExpirationYear().subscribe(
  //     data => {
  //       this.creditCardYear = data;
  //       this.checkoutFormGroup?.get('creditCard.expirationYear')?.setValue(data[0]);
  //     }
  //   )
  // }

  // handleExpirationMonth() {
  //   const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
  //   const currentYear = new Date().getFullYear();
  //   const selectedYear = Number(creditCardFormGroup?.get('expirationYear')?.value)

  //   let startMonth: number = 1;

  //   if (currentYear === selectedYear) {
  //     startMonth = new Date().getMonth() + 1;
  //   } else {
  //     startMonth = 1;
  //   }

  //   this.luv2ShopFormService.getCardExpirationMonth(startMonth).subscribe(
  //     data => {
  //       this.creditCardMonth = data;
  //       creditCardFormGroup?.get('expirationMonth')?.setValue(data[0]);
  //     }
  //   );

  // }

  buildCheckoutForm() {
    const userEmail = JSON.parse(this.storage.getItem('userEmail'));
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl(userEmail, [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{6}')])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{6}')])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: ['', [Validators.required]],
        nameOnCard: ['', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]],
        cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}'), Luv2ShopValidators.luhnCheck]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3}')]],
        expirationMonth: [''],
        expirationYear: ['']
        */
      })
    });
  }

  // Getters for customer
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  // Getters for shippingAddress
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  // Getters for billingAddres
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  // Getters for creditCard
  get cardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get nameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get cardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get securityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }




  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')!.value)
    console.log(this.checkoutFormGroup.get('shippingAddress')!.value)
    console.log(this.checkoutFormGroup.get('billingAddress')!.value)
    console.log(this.checkoutFormGroup.get('creditCard')!.value)



    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    console.log("checkoutFormGroup valid: " + this.checkoutFormGroup.valid);

    // build purchase
    let purchase: Purchase = new Purchase();
    // 1. customer
    purchase.customer = this.checkoutFormGroup.get('customer').value;

    // 2.shippingAddress
    const shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingCountry: Country = JSON.parse(JSON.stringify(shippingAddress.country));
    const shippingState: State = JSON.parse(JSON.stringify(shippingAddress.state));

    purchase.shippingAddress = shippingAddress;
    purchase.shippingAddress.country = shippingCountry.name;
    purchase.shippingAddress.state = shippingState.name;

    // 3. billingAddress
    const billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingCountry: Country = JSON.parse(JSON.stringify(billingAddress.country));
    const billingState: State = JSON.parse(JSON.stringify(billingAddress.state));

    purchase.billingAddress = shippingAddress;
    purchase.billingAddress.country = billingCountry.name;
    purchase.billingAddress.state = billingState.name;

    // 4. order
    purchase.order = new Order(this.totalQuantity, this.totalPrice);

    // 5. orderItems
    purchase.orderItems = this.cartService.cartItems.map(item => new OrderItem(item))


    let stringLog = JSON.stringify(purchase);
    //console.log('purchase: ' + stringLog);

    //========= Stripe integration ================

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "SGD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log("payment amount: " + this.paymentInfo.amount);

    this.isDisabled = true;
    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
      paymentIntentResponse => {
        this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
          {
            payment_method: {
              card: this.cardElement,

              billing_details: {// Extra info
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  state: purchase.billingAddress.state,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCountry.value.code // must be country code
                }
              }
            }
          },
          { handleAction: false }
        ).then(function (result) {
          if (result.error) {
            alert('There was an error: ' + result.error.message);
            this.isDisabled = false;
          } else {
            // call REST API - POST
            this.checkoutService.placeOrder(purchase).subscribe({
              next: response => {
                alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                this.resetCart(); // Xóa giỏ hàng sau khi mua thành công
                this.isDisabled = false;
              },
              error: err => {
                alert(`There was an error: ${err.message}`);
                this.isDisabled = false;
              }
            }
            );
          }
        }.bind(this));
      }
    );
    //========= Stripe integration ================




  }
  resetCart() {
    // reset all from cart service
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persitCardItems();

    // reset Form
    this.checkoutFormGroup.reset();

    // redirect to products
    this.router.navigateByUrl('/products');
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.get('billingAddress')?.setValue(this.checkoutFormGroup.get('shippingAddress')?.value);
      this.billingStates = this.shippingStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingStates = [];
    }
  }
}
