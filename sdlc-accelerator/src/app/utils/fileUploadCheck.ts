import {ValidatorFn, ValidationErrors, AbstractControl} from '@angular/forms';

export function fileUploadCheck(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
        const value = control.value;
        return value.size===0 ? {valid:false}: null;
    }
}