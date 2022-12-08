//  doi tuong
function Validator(option) {

    function getParent (element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};
    // ham xac thuc
    function validate (inputElement, rule) {
        var errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
        var errorMessage;
        
        // lay ra cac rule cua selector
        var rules = selectorRules[rule.selector];
        // lap qua cac rule & kiem tra
        // Neu co loi thi dung viec kiem tra 
        for (var i =0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }
        console.log(errorMessage);
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, option.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    // lay element cua form can validate
    var formElement = document.querySelector(option.form);
    if(formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            option.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            
            });
            
            
            if (isFormValid) {
                if(typeof option.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInput).reduce(function (values, input) {
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    // values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;
                    }, {});

                    option.onSubmit(formValues);
                }
                else {
                    formElement.submit();
                }
            }
            else console.log('co loi');
        }

       option.rules.forEach(function (rule) {
        // luu lai cac rule cho moi in put

        if(Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
        }
        else {
            selectorRules[rule.selector] = [rule.test];
        }

        var inputElements = formElement.querySelectorAll(rule.selector);
        Array.from(inputElements).forEach(function (inputElement) {
            if(inputElement) {
                // xu ly blur
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }
                // xu ly khi nhap lai
    
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
                }
            }
           });
        });

    }
    console.log(selectorRules);
}


// rules
// nguyen tac rule:
// 1. khi co loi => tra message loi
// 2. khi hop le => ko tra gi (undefined)

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập'
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        }
    };
}
Validator.minChar = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= 6 ? undefined : `Nhập hơn ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị không hợp lệ'
        }
    }
}


