//cookie manager
var CookieManager = {
    Set: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    },
    SetObject: function (name, value, days) {
        this.Set(name, JSON.stringify(value), days);
    },

    Get: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    },
    GetObject: function (name) {
        return JSON.parse(this.Get(name));
    },

    Delete: function (name) {
        this.Set(name, "", -1);
    }
}

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });
Object.defineProperty(Array.prototype, "distinct", {
    enumerable: false,
    value: function () {
        var result = [];
        this.each(function (item) { result.add(item) });
        return result;
    }
});
Object.defineProperty(Array.prototype, "itemEquals", {
    enumerable: false,
    value: function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        var distinctedThis = this.distinct();
        // compare lengths - can save a lot of time 
        if (distinctedThis.length != array.distinct().length)
            return false;

        for (var i = 0, l = distinctedThis.length; i < l; i++) {
            if (array.indexOf(this[i]) < 0) {
                return false;
            }
        }
        return true;
    }
});
Array.prototype.find = function (fn) {
    // if the other array is a falsy value, return
    if (typeof (fn) == "function") {
        for (var i = 0; i < this.length; i++) {
            if (fn(this[i], i, this)) {
                return this[i];
            }
        }
    }
    return null;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "find", { enumerable: false });
Array.prototype.each = function (fn) {
    if (typeof (fn) == "function") {
        var temp = ([]).concat(this);
        for (var i = 0; i < temp.length; i++) {
            if (fn.call(this, temp[i], i, this) == false)
                break;
        }
    }
}
Object.defineProperty(Array.prototype, "each", { enumerable: false });
Array.prototype.findAll = function (fn) {
    // if the other array is a falsy value, return
    var result = [];
    if (typeof (fn) == "function") {
        for (var i = 0; i < this.length; i++) {
            if (fn(this[i], i, this)) {
                result.push(this[i]);
            }
        }
    }
    return result;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "findAll", { enumerable: false });
Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index >= 0) {
        this.splice(index, 1);
        return true;
    }
    return false;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "remove", { enumerable: false });
Array.prototype.add = function (item, index) {
    var isExist = this.indexOf(item) >= 0;
    if (!isExist) {
        index = typeof (index) === "number" ? index : this.length;
        this.splice(index, 0, item);
        return true;
    }
    return false;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "add", { enumerable: false });
Object.isEmptyValue = function (value) {
    return value === "" || value === null || value === undefined;
}
Object.defineProperty(Array.prototype, "select", {
    enumerable: false,
    value: function (fn, isDistinct) {
        // if the other array is a falsy value, return
        var result = [];
        if (typeof (fn) == "function") {
            for (var i = 0; i < this.length; i++) {
                var value = fn(this[i], i, this);
                if (typeof (value) !== "undefined" && value != null) {
                    result[isDistinct ? 'add' : 'push'](value);
                }
            }
        }
        return result;
    }
});
Object.defineProperty(Array.prototype, "selectMany", {
    enumerable: false,
    value: function (fn, isDistinct) {
        // if the other array is a falsy value, return
        var result = [];
        if (typeof (fn) == "function") {
            for (var i = 0; i < this.length; i++) {
                var value = fn(this[i], i, this);
                if (typeof (value) !== "undefined" && Array.isArray(value)) {
                    value.each(function (item) {
                        result[isDistinct ? 'add' : 'push'](item);
                    });
                }
            }
        }
        return result;
    }
});
Object.defineProperty(Array.prototype, "group", {
    enumerable: false,
    value: function (fn) {
        // if the other array is a falsy value, return
        var result = [];
        if (typeof (fn) == "function") {
            for (var i = 0; i < this.length; i++) {
                var value = fn(this[i], i, this);
                var existingGroup = result.find(function (item) { return item.Key == value; });
                if (existingGroup == null) {
                    existingGroup = {
                        Key: value,
                        Items: []
                    };
                    result.add(existingGroup);
                }

                existingGroup.Items.add(this[i]);
            }
        }
        return result;
    }
});

Date.IsDate = function (object) {
    return Object.prototype.toString.call(object) === '[object Date]';
}

Date.prototype.toJSON = function () {
    return this.toString("yyyy-MM-dd HH:mm:ss");
}

if (!String.prototype.formatString) {
    Object.defineProperty(String.prototype, "formatString", {
        value: function () {
            result = this;
            if (arguments) {
                for (var i = 0; i < arguments.length; i++) {
                    var regex = new RegExp("\\{" + i + "\\}", "g");
                    result = result.replace(regex, arguments[i]);
                }
            }
            return result;
        },
        enumerable: false
    });
}

// register collection changes listener
if (!Array.prototype.OnCollectionChange) {
    functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
    var stub = function (mtd) {
        var old = Array.prototype[mtd];
        Array.prototype[mtd] = function () {
            var result = null;
            if (this.OnCollectionChange) {
                var oldValue = ([]).concat(this);
                result = old.apply(this, arguments);
                var newValue = ([]).concat(this);
                this.OnCollectionChange(oldValue, newValue, result, this);
            }
            else {
                result = old.apply(this, arguments);
            }
            return result
        }
    }
    for (_i = 0, _len = functions.length; _i < _len; _i++) {
        stub(functions[_i]);
    }
}

var EventManager = {
    HasTransitionSupport: function () {
        var thisBody = document.body || document.documentElement;
        var thisStyle = thisBody.style;

        var support = (
          thisStyle.transition !== undefined ||
          thisStyle.WebkitTransition !== undefined ||
          thisStyle.MozTransition !== undefined ||
          thisStyle.MsTransition !== undefined ||
          thisStyle.OTransition !== undefined
        );

        return support;
    },
    IsTouchEvent: function () {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    RegisterEvent: function (element, eventNames, fn, isUnique) {
        if (!element) return;
        eventNames = eventNames.split(" ");
        for (var i = 0; i < eventNames.length; i++) {
            var eventName = eventNames[i];
            if (!element["__" + eventName]) {
                element["__" + eventName] = [];
            }
            if (isUnique && element["__" + eventName].indexOf(fn) >= 0)
                continue;
            element["__" + eventName].push(fn);
            if (element.addEventListener) {
                element.addEventListener(eventName, fn, false);
            }
            else {
                if (element.attachEvent) {   // IE before version 9
                    element.attachEvent("on" + eventName, fn);
                }
            }
        }
    },
    RemoveEvents: function (element, eventNames, event) {
        if (!element) return;
        eventNames = eventNames.split(" ");
        for (var i = 0; i < eventNames.length; i++) {
            var events = [];
            var eventName = eventNames[i];
            if (element["__" + eventName]) {
                if (!event) {
                    events = element["__" + eventName];
                }
                else if (!Array.isArray(event)) {
                    events = [event];
                }
                for (var j = 0; j < events.length; j++) {
                    if (element.removeEventListener) {
                        element.removeEventListener(eventName, events[j]);
                    }
                    else {
                        if (element.detachEvent) {   // IE before version 9
                            element.detachEvent("on" + eventName, events[j]);
                        }
                    }
                    var index = element["__" + eventName].indexOf(events[j]);
                    element["__" + eventName].splice(index, 1);
                }
            }
        }
    },
    TriggerEvent: function (element, eventNames) {
        eventNames = eventNames.split(" ");
        for (var i = 0; i < eventNames.length; i++) {
            if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent(eventNames[i], false, true);
                element.dispatchEvent(evt);
            }
            else
                element.fireEvent("on" + eventNames[i]);
        }
    },
}

function ExtendableObject(options) {
    Object.defineProperty(this, "SetOptions", {
        value: function (options) {
            if (!options) {
                return false;
            }

            for (var key in options) {
                if (options[key] == null || options[key] == undefined) {
                    continue;
                }
                this[key] = options[key];
            }
        },
        writable: false,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(this, "__SetMethod", {
        value: function (methodName, fn) {
            if (!methodName || typeof (fn) != "function") {
                return false;
            }

            Object.defineProperty(this, methodName, {
                value: fn,
                writable: true,
                enumerable: false,
                configurable: true
            });
        },
        writable: false,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(this, "__SetProperty", {
        value: function (propertyName, setter, getter) {
            if (!propertyName) {
                return false;
            }
            var option = {
                enumerable: true,
                configurable: true
            };
            if (typeof (getter) == "function" || typeof (setter) == "function") {
                if (typeof (setter) == "function")
                    option.set = setter
                if (typeof (getter) == "function")
                    option.get = getter;
            }
            else {
                option.value = setter;
                option.writable = true;
            }

            Object.defineProperty(this, propertyName, option);
        },
        writable: false,
        enumerable: false,
        configurable: false
    });
    this.SetOptions(options);
}
ExtendableObject.prototype.ExtendObject = function (object, options) {
    if (!options) {
        return false;
    }

    for (var key in options) {
        if (options[key] == null || options[key] == undefined) {
            continue;
        }
        object[key] = options[key];
    }
    return true;
}

// validation
function ValidationResult(options) {
    this.IsSuccess = false;
    this.Message = "";
    this.MemberName = "";
    ExtendableObject.call(this, options);
}
function FieldValidationResult(options) {
    this.IsSuccess = true;
    this.ErrorMessages = [];
    ExtendableObject.call(this, options);
    this.AddValidationResult = function (validationResult) {
        if (!validationResult.IsSuccess) {
            this.ErrorMessages.push(validationResult.Message);
        }
        this.IsSuccess = this.IsSuccess && validationResult.IsSuccess;
    }
}
function ValidationResultInfo(options) {
    ExtendableObject.call(this, options);
    this.IsSuccess = true;
    this.__SetMethod("AddValidationResult", function (validationResult) {
        if (!this[validationResult.MemberName]) {
            this[validationResult.MemberName] = new FieldValidationResult();
        }

        var fieldValidResult = this[validationResult.MemberName];
        fieldValidResult.AddValidationResult(validationResult);
        this.IsSuccess = this.IsSuccess && fieldValidResult.IsSuccess;
    });
}
function ValidatorBase(options) {
    this.ErrorMessage = "";
    this.MemberName = "";
    this.ApplyDecoration = function (el, entity, validationResult) { };
    ExtendableObject.call(this, options);
    this.GetErrorMessage = function () {
        return this.ErrorMessage.replace(/\{0\}/ig, this.MemberName);
    }
    this.IsValid = function (source) {
        return true;
    };
    this.Validate = function (source) {
        var result = new ValidationResult({ MemberName: this.MemberName });
        result.IsSuccess = this.IsValid(source);
        result.Message = result.IsSuccess ? "" : this.GetErrorMessage();

        return result;
    };
}
function RequiredValidator(options) {
    ValidatorBase.call(this, options);
    this.ApplyDecoration = function (el, entity, validationResult) {
        if (!el.Decoration) {
            var label = el.querySelector(".control-label");
            if (label) {
                el.Decoration = document.createElement("span");
                el.Decoration.className = "required-decoration";
                label.appendChild(el.Decoration);
                $(el.Decoration).attr("data-title", App.Resources.FieldRequired).attr("data-placement", "auto right").tooltip({ container: el.Decoration.ownerDocument.body });
            }
        }
        if (!entity.IsNew && el.Decoration) {
            if (entity.__originalValues.hasOwnProperty(this.MemberName)) {
                el.Decoration.className = "required-decoration";
            }
            else {
                el.Decoration.className = "hide";
            }
        }
    };
    this.IsValid = function (source) {
        return !!source[this.MemberName];
    };
}
function RegularExpressionValidator(options) {
    this.Pattern = "(?:)";
    ValidatorBase.call(this, options);
    this.IsValid = function (source) {
        var regExp = new RegExp(this.Pattern);
        return source[this.MemberName] ? regExp.test(source[this.MemberName]) : false;
    };
}
function EmailValidator(options) {
    this.Pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    ValidatorBase.call(this, options);
    this.IsValid = function (source) {
        var regExp = new RegExp(this.Pattern);
        return source[this.MemberName] ? regExp.test(source[this.MemberName]) : false;
    };

}
function AlphaNumericValidator(options) {
    RegularExpressionValidator.call(this, options);
}
function PasswordValidator(options) {
    this.PasswordValidations = [
    {
        Regex: "^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[\\d])(?=.*[\\W]).*$",
        ErrorMessage: "Require 8 or more characters.\r\nContains at least one lowercase letter.\r\nContains at least one uppercase letter.\r\nContains at least one digit.\r\nContains at least one special character."
    },
    {
        Regex: "^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[\\d]).*$",
        ErrorMessage: "Require 8 or more characters.\r\nContains at least one lowercase letter.\r\nContains at least one uppercase letter.\r\nContains at least one digit."
    },
    {
        Regex: "^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z]).*$",
        ErrorMessage: "Require 8 or more characters.\r\nContains at least one lowercase letter.\r\nContains at least one uppercase letter."
    },
    {
        Regex: "^.*(?=.{8,})(?=.*[a-z]).*$",
        ErrorMessage: "Require 8 or more characters.\r\nContains at least one lowercase letter."
    },
    {
        Regex: "^.*(?=.*[a-z]).*$",
        ErrorMessage: "Contains at least one lowercase letter."
    }
    ];
    this.MinimumLevel = 3;
    this.ApplyDecoration = function (el) {
    };
    ValidatorBase.call(this, options);
    this.IsValid = function (source) {
        var pattern = this.PasswordValidations[this.PasswordValidations.length - this.MinimumLevel].Regex;
        var regExp = new RegExp(pattern);
        return source[this.MemberName] ? regExp.test(source[this.MemberName]) : false;
    };
    this.GetErrorMessage = function () {
        var erMess = this.ErrorMessage ? this.ErrorMessage : this.PasswordValidations[this.PasswordValidations.length - this.MinimumLevel].ErrorMessage;
        return erMess.replace(/\{0\}/ig, this.MemberName);
    }
}
function VerifyPasswordValidator(options) {
    this.PasswordProperty = [];
    ValidatorBase.call(this, options);
    this.IsValid = function (source) {
        return source[this.MemberName] == source[this.PasswordProperty];
    };
}
function ClientValidator(options) {
    this.ClientValidate = "";
    ValidatorBase.call(this, options);
    this.ApplyDecoration = function (el, entity, validationResult) {
        this.Window = el.ownerDocument.defaultView || el.ownerDocument.parentWindow;
    };
    this.IsValid = function (source) {
        var result = true;
        var fn = (this.Window || window).eval("( function(source){" + this.ClientValidate + "})");
        result = fn.call(this, source);
        return result;
    };
}
function CustomValidator(options) {
    ValidatorBase.call(this, options);
    this.SetOptions(options);
    this.Validate = function (source) {
        var result = new ValidationResult({ MemberName: this.MemberName });
        result.IsSuccess = this.IsValid(source);
        result.Message = result.IsSuccess ? "" : this.GetErrorMessage();

        return result;
    };
}


function DelegateCommand(options) {
    this.CanExecuteCommand = function (model, param) {
        return true;
    }
    this.Command = function (model, param) {

    }
    this.Parameter = null;
    ExtendableObject.call(this, options);

    var __bind = function (fn, me) { return function (event, model) { return fn.call(me, this, model, event); }; };

    this.__Command = __bind(function (el, model, event) {
        if (this.__CanExecuteCommand.call(el, event, model)) {
            this.Command.call(this, model, el["__command-parameter"], el, event);
        }
    }, this);
    this.__CanExecuteCommand = __bind(function (el, model, event) {
        if (this.IsProcessing)
            return false;

        if (typeof (this.CanExecuteCommand) == "function")
            return this.CanExecuteCommand.call(this, model, el["__command-parameter"], el, event) !== false;
        else
            return true;
    }, this);

    this.RaiseCanExecuteChange = function () {
        App.BindingService.TriggerChange(this, "__CanExecuteCommand");
    }

    var isProcessing = false;
    Object.defineProperty(this, "IsProcessing", {
        set: function (value) {
            if (isProcessing != value) {
                isProcessing = value;
                this.RaiseCanExecuteChange();
                App.BindingService.TriggerChange(this, "IsProcessing");
            }
        },
        get: function () {
            return isProcessing;
        },
        enumerable: true,
        configurable: true,
    });
}

// binding
var CommandBindingAdapter = function () {
    this.Attibute = "command";
    this.publishes = true;
    this.Context = null;
    this.priority = 10000;
    this.bind = function (el) {
        this.view.buildBinding('Binding', el, "on-click", this.keypath + ".__Command");
        var binding = this.view.bindings[this.view.bindings.length - 1];
        binding.bind();
        this.nestedBindings = [];
        this.nestedBindings.push(binding);

        this.view.buildBinding('Binding', el, "can-execute-command", this.keypath + ".__CanExecuteCommand");
        binding = this.view.bindings[this.view.bindings.length - 1];
        binding.bind();
        this.nestedBindings.push(binding);

        this.view.buildBinding('Binding', el, "command-is-processing", this.keypath + ".IsProcessing");
        binding = this.view.bindings[this.view.bindings.length - 1];
        binding.bind();
        this.nestedBindings.push(binding);

        return true;
    };
    this.unbind = function (el) {
        for (var i = 0; i < this.nestedBindings.length; i++) {
            this.nestedBindings[i].unbind();
        }
        return true;
    };
    this.routine = function (el, value) {
        el.__command = value;
        if (el.__command && el.__command.RaiseCanExecuteChange)
            el.__command.RaiseCanExecuteChange();
        return value;
    }
}
var CanExecuteCommandBindingAdapter = function () {
    this.Attibute = "can-execute-command";
    this.publishes = true;
    this.Context = null;
    this.priority = 10000;
    this.routine = function (el, value) {
        if (typeof (value) == "function") {
            var result = value.call(el, null, this.view.models);
            return el.disabled = !result;
        }
    }
}

var CommandParameterBindingAdapter = function () {
    this.Attibute = "command-parameter";
    this.publishes = true;
    this.Context = null;
    this.priority = 10000;
    this.routine = function (el, value) {
        if (el["__command-parameter"] != value) {
            el["__command-parameter"] = value;
            if (el.__command && el.__command.RaiseCanExecuteChange) {
                el.__command.RaiseCanExecuteChange();
            }
        }
        return value;
    }
}
var CommandIsProcessingBindingAdapter = function (option) {
    this.Attibute = "command-is-processing";
    this.publishes = true;
    this.Context = null;
    this.priority = 10000;
    this.ProccessingTemplate = '<div><i class="webui-icon webui-spin webui-load-c"></i></div>';
    ExtendableObject.call(this, option);
    this.routine = function (el, value) {
        if (!el.hasOwnProperty("__innitialHTML")) {
            Object.defineProperty(el, "__innitialHTML", {
                value: "",
                enumerable: false,
                configurable: true,
                writable: true
            });
        }
        if (value) {
            el.setAttribute("is-processing", true);

            el.__innitialHTML = [];

            for (var i = 0, length = el.childNodes.length; i < length; i++) {
                el.__innitialHTML.push(el.childNodes[0]);
                el.removeChild(el.childNodes[0]);
            }

            el.__initialbackgroundImage = el.style.backgroundImage;
            el.style.backgroundImage = "none";
            el.innerHTML = this.binder.ProccessingTemplate;
        }
        else {
            el.removeAttribute("is-processing");
            if (el.__innitialHTML) {
                el.innerHTML = "";
                for (var i = 0; i < el.__innitialHTML.length; i++) {
                    el.appendChild(el.__innitialHTML[i]);
                }
                el.__innitialHTML = null;
            }
            if (el.__initialbackgroundImage) {
                el.style.backgroundImage = el.__initialbackgroundImage;
                el.__initialbackgroundImage = null;
            }
        }
        return value;
    }
}

var ValidationBindingAdapter = function () {
    this.Attibute = "validate";
    this.publishes = true;
    this.Context = null;
    this.Entity = null;
    this.MemberName = null;

    var timeout = null;
    this.priority = 10000;
    this.GetEntity = function (bindingContext) {
        var pathes = bindingContext.keypath.split(".");
        return bindingContext.observer.objectPath[pathes.length - 2];
    };
    this.GetMemberName = function (bindingContext) {
        var pathes = bindingContext.keypath.split(".");
        return pathes.pop();
    };
    this.bind = function (el) {
        el.helpBlock = el.ownerDocument.createElement("span");
        el.helpBlock.className = "help-block";
        el.appendChild(el.helpBlock);
        var pathes = this.keypath.split(".");

        return true
    };
    this.unbind = function (el) {
        return true;
    };
    this.routine = function (el, value) {
        el.classList.remove("has-error");
        el.classList.remove("has-success");
        el.helpBlock.innerHTML = "";
        if (value) {
            if (value.IsSuccess) {
                el.classList.add("has-success");
            }
            else {
                el.classList.add("has-error");
                el.helpBlock.innerHTML = value.ErrorMessages[0];

                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function () {
                    var firstErrorEl = el.ownerDocument.querySelector(".has-error input, .has-error textarea");

                    var elem = $(firstErrorEl);
                    var window = firstErrorEl.ownerDocument.defaultView || firstErrorEl.ownerDocument.parentWindow;

                    var pageTop = $(window).scrollTop();
                    var pageBottom = pageTop + $(window).height() - 100;
                    var elementTop = elem.offset().top;
                    var elementBottom = elementTop + elem.height();

                    if ((pageTop > elementTop) || (pageBottom < elementBottom)) {
                        $(firstErrorEl.ownerDocument.body).animate({
                            scrollTop: elementTop - 100
                        }, 500, 'swing', function () {
                            firstErrorEl.focus();
                            firstErrorEl.select();
                        });
                    }
                    else {
                        firstErrorEl.focus();
                        firstErrorEl.select();
                    }
                }, 100);
            }
        }
        var entity = this.binder.GetEntity(this);
        var prop = this.binder.GetMemberName(this);
        if (entity && entity.GetPropertyValidators) {
            var validators = entity.GetPropertyValidators(prop);
            for (var i = 0; i < validators.length; i++) {
                var validator = validators[i];
                validator.ApplyDecoration(el, entity, value);
            }
        }
        return true;
    }
}

function HttpClientService(options) {
    this.OnError = function () { };
    this.OnSuccess = function () { };
    this.ParseData = function (data) { return data; };
    this.ParseUrl = function (controller, action, data, filter) { console.error("please specify ParseUrl method"); }
    ExtendableObject.call(this, options);
    this.Request = function (method, url, data, filter) {
        var cleanData = this.ParseData(data, filter);

        var promise = $.ajax({
            method: method,
            url: url,
            data: cleanData
        });

        promise.done(function () {
            if (data && data.Is)
                this.Entity = data;
        });

        if (typeof (this.OnError) == "function") {
            promise.fail(this.OnError);
        }

        if (typeof (this.OnSuccess) == "function") {
            promise.done(this.OnSuccess);
        }
        return promise;
    };
    this.Post = function (controller, action, data, filter) {
        return this.Request("POST", this.ParseUrl(controller, action, data, filter), data, filter);
    };
    this.Get = function (controller, action, data, filter) {
        return this.Request("GET", this.ParseUrl(controller, action, data, filter), data, filter);
    };
    this.Put = function (controller, action, data, filter) {
        return this.Request("PUT", this.ParseUrl(controller, action, data, filter), data, filter);
    };
    this.HttpDelete = function (controller, action, data, filter) {
        return this.Request("DELETE", this.ParseUrl(controller, action, data, filter), data, filter);
    };
}
function BindingService(options) {
    this.Bindings = [];
    this.Context = null;
    this.BindingViews = [];
    this.Bind = function (rootElement, model) {
        var bindingView = this.Context.bind(rootElement, model);
        this.BindingViews.push(bindingView);
        return bindingView;
    }
    this.Unbind = function (bindingView) {
        var index = this.BindingViews.indexOf(bindingView);
        this.BindingViews.splice(index, 1);
        bindingView.unbind();
    }
    this.UnbindAll = function () {
        for (var i = 0; i < this.BindingViews.length; i++) {
            this.BindingViews[i].unbind();
        }
    }
    this.OnInitialize = function () {

    }
    ExtendableObject.call(this, options);
    this.RegisterBindings = function () {
        if (this.Context) {
            for (var i = 0; i < this.Bindings.length; i++) {
                var item = this.Bindings[i];
                item.Context = this.Context;
                this.Context.binders[item.Attibute] = item;
            }
        }
    }
    this.OnInitialize();

    var templateEl = document.createElement("div");
    this.GetText = function (textTemplate, model) {
        templateEl.innerHTML = textTemplate;
        var view = App.BindingService.Bind(templateEl, model);
        var result = templateEl.innerHTML;
        App.BindingService.Unbind(view);
        return result;
    }
}

// entity
function EntityBase(options) {
    this.OnPropertyChanged = function (propertyName, oldValue, newValue) {
    };
    ExtendableObject.call(this, options);
    this.IsDirty = false;
    this.SetProperty = function (prop) {
        var entity = this;
        var registerCollectionChange = function (arrayValue) {
            if (!arrayValue.OnCollectionChange) {
                arrayValue.OnCollectionChange = function (oldValue, value, result, array) {
                    if (!oldValue.itemEquals(array)) {
                        if (entity.__enableTrackChanges && prop != "IsDirty") {
                            var oldValueDefault = oldValue === "" || oldValue === undefined || oldValue === null ? [] : oldValue;
                            var valueDefault = array === "" || array === undefined || array === null ? [] : array;

                            if (oldValueDefault != valueDefault) {
                                if (!oldValueDefault.itemEquals(valueDefault)) {
                                    if (!entity.__originalValues.hasOwnProperty(prop)) {
                                        entity.__originalValues[prop] = ([]).concat(oldValueDefault);
                                    }
                                    else {
                                        if (entity.__originalValues[prop].itemEquals(valueDefault)) {
                                            delete entity.__originalValues[prop];
                                        }
                                    }
                                }
                            }
                            entity.IsDirty = Object.keys(entity.__originalValues).length > 0;
                        }
                    }
                    entity.OnPropertyChanged(prop, oldValue, array);
                }
            }
        }
        if (Array.isArray(this[prop])) {
            if (!this[prop].OnCollectionChange) {
                registerCollectionChange(this[prop]);
            }
        }
        this.ModifyProperty(prop, function (oldValue, value) {
            if (oldValue != value) {
                if (Array.isArray(value)) {
                    if (!value.OnCollectionChange) {
                        registerCollectionChange(this[prop]);
                    }
                }

                if (this.__enableTrackChanges && prop != "IsDirty") {
                    if (!Array.isArray(oldValue) && !Array.isArray(value)) {
                        var oldValueDefault = oldValue === "" || oldValue === undefined || oldValue === null ? null : oldValue;
                        var valueDefault = value === "" || value === undefined || value === null ? null : value;

                        if (oldValueDefault != valueDefault) {
                            if (!this.__originalValues.hasOwnProperty(prop)) {
                                this.__originalValues[prop] = oldValueDefault;
                            }
                            else {
                                if (this.__originalValues[prop] == valueDefault) {
                                    delete this.__originalValues[prop];
                                }
                            }
                        }
                        this.IsDirty = Object.keys(this.__originalValues).length > 0;
                    }
                }
                this.OnPropertyChanged(prop, oldValue, value);
            }
        });
    };
    this.Initialize = function () {
        for (var prop in this) {
            var value = this[prop];
            if (this.hasOwnProperty(prop) && typeof (value) != "function") {
                this.SetProperty(prop);
            }
        }
        Object.defineProperty(this, "__validators", {
            value: {},
            enumerable: false,
            configurable: true,
            writable: true
        });
        Object.defineProperty(this, "ValidationResult", {
            value: null,
            enumerable: false,
            configurable: true,
            writable: true
        });
        Object.defineProperty(this, "__originalValues", {
            value: {},
            enumerable: false,
            configurable: true,
            writable: true
        });
    };
    this.ModifyProperty = function (propName, setterFn, getterFn) {
        var desc = Object.getOwnPropertyDescriptor(this, propName);
        var oldSet = desc ? desc.set : undefined;
        var oldGet = desc ? desc.get : undefined;
        var tempValue = desc ? desc.value : undefined;
        Object.defineProperty(this, propName, {
            get: function () {
                if (typeof (getterFn) == "function") getterFn.apply(this, arguments);
                if (typeof (oldGet) == "function")
                    return oldGet.apply(this, arguments);
                else
                    return tempValue;
            },
            set: function (value) {
                var oldValue = this[propName];
                if (typeof (oldSet) == "function")
                    oldSet.apply(this, arguments);
                else
                    tempValue = value;
                if (typeof (setterFn) == "function") {
                    setterFn.call(this, oldValue, value);
                }
            },
            enumerable: true,
            configurable: true
        });
    };

    // validation
    this.RegisterValidators = function (validators) {
        for (var i = 0; i < validators.length; i++) {
            var validator = validators[i];
            if (window[validator.ValidatorType]) {
                var validatorObject = new window[validator.ValidatorType](validator.Validator);
                validatorObject.MemberName = validator.MemberName;
                this.AddValidator(validatorObject);
            }
        }
    }
    this.AddValidator = function (validator) {
        if (!this.__validators[validator.MemberName]) {
            this.__validators[validator.MemberName] = [];
        }
        var exist = this.__validators[validator.MemberName].find(function (item) { return item.constructor == validator.constructor });
        if (!exist)
            this.__validators[validator.MemberName].push(validator);
    }
    this.Validate = function (props) {
        if (props && typeof (props) == "string") {
            props = props.split(/\s*,\s*/);
        }
        this.ValidationResult = this.GetValidationResult(props);

        if (this.ValidationResult)
            return this.ValidationResult.IsSuccess;

        return true;
    }
    this.GetValidationResult = function (props) {
        var result = new ValidationResultInfo();

        if (props && typeof (props) == "string") {
            props = props.split(/\s*,\s*/);
        }

        for (var memberName in this.__validators) {
            if (props && props.indexOf(memberName) < 0) {
                continue;
            }

            for (var i = 0; i < this.__validators[memberName].length; i++) {
                var validator = this.__validators[memberName][i];
                if (result[memberName] && !result[memberName].IsSuccess) {
                    continue;
                }

                if (this.hasOwnProperty(validator.MemberName))
                    result.AddValidationResult(validator.Validate(this));
            }
        }

        return result;
    }
    this.RemoveValidationState = function (props) {
        if (!props || !this.ValidationResult)
            return false;

        if (typeof (props) == "string") {
            props = props.split(/\s*,\s*/);
        }

        var pass = false;
        for (var i = 0; i < props.length; i++) {
            if (this.ValidationResult && typeof (this.ValidationResult) == "object" && this.ValidationResult.hasOwnProperty(props[i])) {
                this.ValidationResult[props[i]] = null;
                delete this.ValidationResult[props[i]];
                pass = true;
            }
        }

        if (pass) {
            var isValidateSuccess = true;
            for (var key in this.ValidationResult) {
                if (key != "IsSuccess" && this.ValidationResult[key] && this.ValidationResult[key].hasOwnProperty("IsSuccess"))
                    isValidateSuccess = isValidateSuccess && this.ValidationResult[key].IsSuccess;
            }
            this.ValidationResult.IsSuccess = isValidateSuccess;
        }

        return true;
    }
    this.GetPropertyValidators = function (prop) {
        var result = [];
        if (!prop) {
            return result;
        }
        if (this.__validators[prop]) {
            result = result.concat(this.__validators[prop]);
        }
        return result;
    }
    this.Initialize();
}

window.App = {
    InitializeService: function () {

        this.HttpService = new HttpClientService({
            OnError: function (jqXHR, textStatus, errorThrown) {
                // ...
            },
            OnSuccess: function (result, textStatus, jqXHR) {
                // ...
            },
            ParseUrl: function (controller, action, data, filter) {
                return "https://my.isellercommerce.com/service/" + controller + "/" + action;
            },
            ParseData: function (data, filter) {
                return data;
            }
        });
        this.BindingService = new BindingService({
            Context: window.rivets,

            OnInitialize: function () {
                var originalValueRoutine = this.Context.binders.value.routine;
                this.Context.binders.value.routine = function (el, value) {
                    var result = originalValueRoutine(el, value);

                    // raised change event
                    EventManager.TriggerEvent(el, "change");
                    return result;
                };

                this.Context.binders.value.bind = function (el) {
                    if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
                        this.event = el.tagName === 'SELECT' ? 'change' : 'input';
                        if (el.tagName === 'INPUT') {
                            // safari auto complete issue
                            App.BindingService.Context["_"].Util.bindEvent(el, "blur", this.publish);
                        }
                        return App.BindingService.Context["_"].Util.bindEvent(el, this.event, this.publish);
                    }
                }
                // fix rivets each unbind
                this.Context.binders['each-*'].unbind = function (el) {
                    var view, _i, _len, _ref1;
                    if (this.iterated != null) {
                        _ref1 = this.iterated;
                        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                            view = _ref1[_i];
                            view.unbind();
                            if (view.els[0].parentNode)
                                view.els[0].parentNode.removeChild(view.els[0]);
                        }
                        el.setAttribute([this.view.prefix, this.type].join('-').replace('--', '-'), this.keypath);
                        if (this.marker.parentNode) {
                            this.marker.parentNode.insertBefore(el, this.marker);
                            this.marker.parentNode.removeChild(this.marker);
                        }
                    }
                };
                this.Context.binders['on-*'].routine = function (el, value) {
                    if (this.handler) {
                        App.BindingService.Context["_"].Util.unbindEvent(el, this.args[0], this.handler);
                    }
                    this.handler = this.eventHandler(value);
                    if (this.args[0] == "click") {
                        var oldHandler = this.handler;
                        this.handler = function () {
                            if (this.hasAttribute("disabled"))
                                return;

                            oldHandler.apply(this, arguments);
                        };
                    }
                    return App.BindingService.Context["_"].Util.bindEvent(el, this.args[0], this.handler);
                };
                this.Context.binders.enabled = function (el, value) {
                    el.disabled = !value;
                    if (el.disabled) {
                        el.setAttribute("disabled", true);
                    }
                    else {
                        el.removeAttribute("disabled");
                    }
                    return el.disabled;
                };
                this.Context.binders.disabled = function (el, value) {
                    el.disabled = !!value;
                    if (el.disabled) {
                        el.setAttribute("disabled", true);
                    }
                    else {
                        el.removeAttribute("disabled");
                    }
                    return el.disabled;
                };

                var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
                this.Context.adapters['.'].observe = function (obj, keypath, callback) {
                    var callbacks, desc, value;
                    callbacks = this.weakReference(obj).callbacks;
                    if (callbacks[keypath] == null) {
                        callbacks[keypath] = [];
                        desc = Object.getOwnPropertyDescriptor(obj, keypath);
                        if (!((desc != null ? desc.get : void 0) || (desc != null ? desc.set : void 0))) {
                            value = obj[keypath];
                            Object.defineProperty(obj, keypath, {
                                enumerable: true,
                                configurable: true,
                                get: function () {
                                    return value;
                                },
                                set: (function (_this) {
                                    return function (newValue) {
                                        var cb, map, _i, _len, _ref1;
                                        if (newValue !== value) {
                                            _this.unobserveMutations(value, obj[_this.id], keypath);
                                            value = newValue;
                                            if (map = _this.weakmap[obj[_this.id]]) {
                                                callbacks = map.callbacks;
                                                if (callbacks[keypath]) {
                                                    _ref1 = callbacks[keypath];
                                                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                                                        cb = _ref1[_i];
                                                        cb && cb();
                                                    }
                                                }
                                                return _this.observeMutations(newValue, obj[_this.id], keypath);
                                            }
                                        }
                                    };
                                })(this)
                            });
                        }
                    }
                    if (__indexOf.call(callbacks[keypath], callback) < 0) {
                        callbacks[keypath].push(callback);
                    }
                    return this.observeMutations(obj[keypath], obj[this.id], keypath);
                };
                this.Context.adapters['.'].stubFunction = function (obj, fn) {
                    var map, original, weakmap;
                    original = obj[fn];
                    map = this.weakReference(obj);
                    weakmap = this.weakmap;
                    return obj[fn] = function () {
                        var callback, k, r, response, _i, _len, _ref1, _ref2, _ref3, _ref4;
                        response = original.apply(obj, arguments);
                        _ref1 = map.pointers;
                        for (r in _ref1) {
                            k = _ref1[r];
                            _ref4 = (_ref2 = (_ref3 = weakmap[r]) != null ? _ref3.callbacks[k] : void 0) != null ? _ref2 : [];
                            for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
                                callback = _ref4[_i];
                                if (callback)
                                    callback();
                            }
                        }
                        return response;
                    };
                }

                this.Context.formatters['='] = function (value, arg) {
                    return value == arg;
                }
                this.Context.formatters['!='] = function (value, arg) {
                    return value != arg;
                }
                this.Context.formatters['not'] = function (value, arg) {
                    return !value;
                }
                this.Context.formatters['>'] = function (value, arg) {
                    return value > arg;
                }
                this.Context.formatters['>='] = function (value, arg) {
                    return value >= arg;
                }
                this.Context.formatters['<'] = function (value, arg) {
                    return value < arg;
                }
                this.Context.formatters['<='] = function (value, arg) {
                    return value <= arg;
                }
                this.Context.formatters['and'] = this.Context.formatters['&&'] = function (value, arg) {
                    return value && arg;
                }
                this.Context.formatters['or'] = this.Context.formatters['||'] = function (value, arg) {
                    return value || arg;
                }
                this.Context.formatters['isFirst'] = function (value, arg) {
                    return value[0] == arg;
                }
                this.Context.formatters['isLast'] = function (value, arg) {
                    return value[value.length - 1] == arg;
                }
                this.Context.formatters['int'] = {
                    publish: function (value) {
                        var val = parseInt(value)
                        return isNaN(val) ? 0 : val;
                    }
                }
                this.Context.formatters['float'] = {
                    publish: function (value) {
                        var val = parseFloat(value)
                        return isNaN(val) ? 0 : val;
                    }
                }
                this.Context.formatters['=?'] = {
                    read: function (value, arg1, arg2, arg3) {
                        return value == arg1;
                    },
                    publish: function (value, arg1, arg2, arg3) {
                        return value ? arg1.replace(/^'|'$/g, "") : arg3.replace(/^'|'$/g, "");
                    }
                }
                this.Context.formatters['count'] = function (value, arg) {
                    return value && value.length ? value.length : 0;
                }
                this.Context.formatters['?'] = function (value, arg1, arg2, arg3) {
                    return value ? arg1 : arg3;
                }
                this.Context.formatters['format'] = function (value, arg) {
                    var vals = [value]
                    if (arguments.length > 2) {
                        for (var i = 2; i < arguments.length; i++) {
                            vals.push(arguments[i])
                        }
                    }
                    arg = (arg ? arg : "").replace(/\[\[([0-9]+)\]\]/g, "{$1}");
                    return arg.formatString.apply(arg, vals);
                }
                this.Context.formatters['lowercase'] = function (value) {
                    return value.toString().toLowerCase();
                }
                this.Context.formatters['uppercase'] = function (value) {
                    return value.toString().toUpperCase();
                }
                this.Context.formatters['capitalize'] = function (value, isAll) {
                    value = value.toString();
                    if (isAll)
                        return value.split(" ").each(function (item) { return item.charAt(0).toUpperCase() + item.slice(1); }).join(" ");

                    return value.charAt(0).toUpperCase() + value.slice(1);
                }
                this.Context.formatters['formatDate'] = function (value, format) {
                    if (value != null) {
                        date = new Date(value);
                        return date.toString(format);
                    }
                    else {
                        return "";
                    }
                }
                this.Context.formatters['isNullorEmpty'] = function (value) {
                    return value === null || value === undefined || value === "";
                }
                this.Context.formatters['in'] = function (value, arg, splitChar) {
                    if (arg) {
                        if (splitChar) {
                            return arg.split(splitChar).indexOf(value) >= 0;
                        }
                        else if (arg.indexOf) {
                            return arg.indexOf(value) >= 0;
                        }
                    }

                    return value == arg;
                }
                this.Context.formatters['contain'] = function (value, arg) {
                    if (value && value.indexOf) {
                        return value.indexOf(arg) >= 0;
                    }

                    return value == arg;
                }

                this.Context.formatters['filter'] = this.Context.formatters['Filter'] = function (value, compare) {
                    if (!Array.isArray(value)) {
                        value = [value];
                    }
                    if (!compare) {
                        compare = "return Item";
                    }
                    compare = eval("(function (Item, index){" + compare + "})");
                    result = [];
                    result = value.findAll(compare);

                    return result;
                }
                this.Context.formatters['isNotDeleted'] = this.Context.formatters['filterNotDeleted'] = function (value) {
                    if (Array.isArray(value)) {
                        return value.findAll(function (item) { return !item.IsDeleted });
                    }
                    else {
                        return value && !value.IsDeleted ? value : null;
                    }
                }
                this.Context.formatters['eval'] = function (value, arg) {
                    var win = App.NavigationService.GetContentWindow();
                    if (!win)
                        win = window;

                    var result = false;
                    try {
                        var fn = eval("(function(value){" + arg + "})");
                        result = fn.call(win, value);
                    }
                    catch (e) {
                        result = false;
                    }
                    return result;
                }
                this.Context.formatters['indexOf'] = function (value, arg) {
                    return value.indexOf(arg);
                }
                this.Context.formatters['color'] = function (color) {
                    if (typeof (color) == "object" && color) {
                        color = color.Value;
                    }
                    return color ? color.replace(/^#FF/i, "#") : "";
                }
                this.Context.formatters.currency = {
                    read: function (value, rounding, minLength) {
                        if (value != null && value != undefined) {
                            var floatValue = parseFloat(value);
                            value = isNaN(floatValue) ? App.UnformatNumber(value) : floatValue;
                            return App.FormatCurrency(value, rounding, null, minLength);
                        }
                        return "";
                    },
                    publish: function (value, minLength) {
                        var floatValue = parseFloat(value);
                        value = isNaN(floatValue) ? App.UnformatNumber(value) : floatValue;
                        return value;
                    }
                }
                this.Context.formatters.number = {
                    read: function (value, rounding, precision) {
                        if (value != null && value != undefined) {
                            var floatValue = parseFloat(value);
                            value = isNaN(floatValue) ? App.UnformatNumber(value) : floatValue;
                            return App.FormatNumber(value, rounding, precision);
                        }
                        return "";
                    },
                    publish: function (value, minLength) {
                        var floatValue = parseFloat(value);
                        value = isNaN(floatValue) ? App.UnformatNumber(value) : floatValue;
                        return value;
                    }
                }
                this.Context.formatters['fn'] = function (value, arg) {
                    var args = [value];

                    for (var i = 2; i < arguments.length; i++) {
                        if (arguments[i]) {
                            args.push(arguments[i]);
                        }
                    }

                    if (eval)
                        return eval(arg).apply(this, args);
                    else
                        return value;
                }
                this.Context.formatters['dialogTitle'] = function (entity, arg) {
                    var result = "";
                    if (entity.IsNew) {
                        result += App.Resources.Add + " " + App.Resources[entity.__entityType]
                    }
                    else {
                        result += App.Resources.Edit + " " + App.Resources[entity.__entityType] + (entity.Name ? " - " + entity.Name : "");
                    }
                    return result;
                }

                this.RegisterBindings();

            },

            TriggerChange: function (model, path) {
                var paths = path.split(".");
                var keypath = paths.pop();
                for (var i = 0; i < paths.length; i++) {
                    model = model[paths[i]];
                }
                for (var adapterKey in this.Context.adapters) {
                    var adapter = this.Context.adapters[adapterKey];
                    if (map = adapter.weakmap[model[adapter.id]]) {
                        callbacks = map.callbacks;
                        if (callbacks[keypath]) {
                            _ref1 = callbacks[keypath];
                            for (var _i = 0, _len = _ref1.length; _i < _len; _i++) {
                                cb = _ref1[_i];
                                cb && cb();
                            }
                        }
                    }
                }
            },
            Bindings: [
                new ValidationBindingAdapter(),
                new CommandBindingAdapter(),
                new CommandIsProcessingBindingAdapter({
                    ProccessingTemplate: "<span class=\"loading-icon\"></span>"
                }),
                new CanExecuteCommandBindingAdapter(),
                new CommandParameterBindingAdapter()
            ]
        });
    },
    SetNumberFormat: function (obj) {
        if (!obj)
            return;
        App.NumberFormat = obj;
    },
    FormatNumber: function (value, rounding, precision, format) {
        if ((["round", "ceil", "floor"]).indexOf(rounding) < 0) {
            rounding = "floor";
        }

        if (isNaN(parseInt(precision)) && precision !== "") {
            precision = App.NumberFormat.Currency.Precision;
        }

        var numberFormat = "%v";
        if (value < 0) {
            numberFormat = "-%v";
            value = value * -1;
        }

        var roundedValue = value;

        if (!isNaN(parseInt(precision))) {
            var power = Math.pow(10, precision);
            roundedValue = Math[rounding](value * power) / power;
        }

        var valueSplit = roundedValue.toString().split('.');
        var thousandValue = valueSplit[0];
        var decimalValue = valueSplit.length > 1 ? valueSplit[1] : "";

        for (var gindex = 0, i = gsize = App.NumberFormat.Number.GroupSizes[0]; i < thousandValue.length; i = i + gsize) {
            var thousandValue = [thousandValue.slice(0, thousandValue.length - i), ",", thousandValue.slice(thousandValue.length - i)].join('');
            i++;
            if (gindex < App.NumberFormat.Number.GroupSizes.length - 1) {
                gindex++;
                gsize = App.NumberFormat.Number.GroupSizes[gindex];
            }
        }

        var result = thousandValue.replace(/,/ig, App.NumberFormat.Number.Thousand) + (decimalValue ? App.NumberFormat.Number.Decimal + decimalValue : "");
        result = numberFormat.replace("%v", result);
        return result;
    },
    FormatCurrency: function (value, rounding, precision, minLength, format) {
        if ((["round", "ceil", "floor"]).indexOf(rounding) < 0) {
            rounding = "floor";
        }

        if (isNaN(parseInt(precision)) && precision !== "") {
            precision = App.NumberFormat.Currency.Precision;
        }

        var numberFormat = "%v";
        var cformats = App.NumberFormat.Currency.Format;
        if (value > 0) {
            numberFormat = cformats.Pos;
        }
        else if (value < 0) {
            numberFormat = cformats.Neg;
            value = value * -1;
        }
        else {
            numberFormat = cformats.Zero;
        }

        var roundedValue = value;

        if (!isNaN(parseInt(precision))) {
            var power = Math.pow(10, precision);
            roundedValue = Math[rounding](value * power) / power;
        }

        var valueSplit = roundedValue.toString().split('.');
        var thousandValue = valueSplit[0];
        var decimalValue = valueSplit.length > 1 ? valueSplit[1] : "";

        for (var gindex = 0, i = gsize = App.NumberFormat.Currency.GroupSizes[0]; i < thousandValue.length; i = i + gsize) {
            var thousandValue = [thousandValue.slice(0, thousandValue.length - i), ",", thousandValue.slice(thousandValue.length - i)].join('');
            i++;
            if (gindex < App.NumberFormat.Currency.GroupSizes.length - 1) {
                gindex++;
                gsize = App.NumberFormat.Currency.GroupSizes[gindex];
            }
        }

        if (minLength && !isNaN(minLength)) {
            var spacelength = minLength - thousandValue.toString().length;
            if (spacelength > 0) {
                var space = "";
                for (var i = 0; i < spacelength; i++) {
                    space += " ";
                }
                numberFormat = numberFormat.replace("%s ", "%s " + space);
            }
        }

        var result = thousandValue.replace(/,/ig, App.NumberFormat.Currency.Thousand) + (decimalValue ? App.NumberFormat.Currency.Decimal + decimalValue : "");

        result = numberFormat.replace("%v", result);
        result = result.replace("%s", App.NumberFormat.Currency.Symbol);
        return result;
    },
    UnformatNumber: function (value) {
        value = value || 0;

        // Return the value as-is if it's already a number:
        if (typeof value === "number") return value;

        var isCurrency = ("" + value).indexOf(App.NumberFormat.Currency.Symbol) >= 0;

        // Default decimal point comes from settings, but could be set to eg. "," in opts:
        var decimal = App.NumberFormat[isCurrency ? "Number" : "Currency"].Decimal;
        var thousand = App.NumberFormat[isCurrency ? "Number" : "Currency"].Thousand;


        // Build regex to strip out everything except digits, decimal point and minus sign:
        var regex = new RegExp("[^0-9." + decimal + "]", ["g"]);
        var unformatted = ("" + value)
        .replace(regex, '')         // strip out any cruft
        .replace(decimal, '.')      // make sure decimal point is standard

        var negFormat = "-%v";
        if (isCurrency) {
            var cformats = App.NumberFormat.Currency.Format;
            if (cformats.Neg != cformats.Pos && cformats.Neg != cformats.Zero) {
                negFormat = cformats.Neg;
            }
        }

        var negRegexp = new RegExp("^" + negFormat.replace(/(.)/g, "\\$1").replace(/\\%\\v/g, "[0-9" + decimal + thousand + "]+").replace(/\\%\\s/g, App.NumberFormat.Currency.Symbol) + "$", ["g"]);
        if (negRegexp.test("" + value) || (isCurrency && (new RegExp("^-[ ]*" + App.NumberFormat.Currency.Symbol + "[ ]*[0-9" + decimal + thousand + "]+[ ]*$", ["g"])).test(value + ""))) {
            unformatted = "-" + unformatted;
        }

        unformatted = parseFloat(unformatted);

        // This will fail silently which may cause trouble, let's wait and see:
        return !isNaN(unformatted) ? unformatted : 0;
    }
}

window.App.InitializeService();

/// example
//var model = { Name: "" };
//model.OnPropertyChanged = function (prop, oldValue, newValue) {
//    if (oldValue != newValue) {
//        this.RemoveValidationState(prop);
//        App.BindingService.TriggerChange(this, prop);
//    }
//}
//var model = new EntityBase(model);
//item.AddValidator(new RequiredValidator({ MemberName: "Name", ErrorMessage: "name is required." }));