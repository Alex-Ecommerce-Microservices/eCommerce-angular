import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
        if ((control.value != null) && (control.value.trim().length === 0)) {
            return { 'notOnlyWhiteSpace': true };
        } else {
            return null;
        }
    }

    static luhnCheck(control: FormControl): ValidationErrors | null { 
        let value = control.value;

        if (!value) {
            return null;
        }

        // Loại bỏ các khoảng trắng nếu có
        value = value.replace(/\s+/g, '');

        let sum = 0;
        let shouldDouble = false;

        // Duyệt từ phải sang trái
        for (let i = value.length - 1; i >= 0; i--) {
            let digit = parseInt(value.charAt(i));

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        // Nếu tổng chia hết cho 10 thì số thẻ hợp lệ
        if (sum % 10 === 0) {
            return null;
        } else {
            return { 'luhnCheck': true };
        }
    }
}
