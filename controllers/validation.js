// TODO: Refactory to a utils module

function Validator (label, target, errorsOwner) {
  this.label = label;
  this.target = target;
  this.errorsOwner = errorsOwner;
  this.value = target[label];
  this.is = this;
  this.otherwise = this;
  this.and = this;
  this.isOk = true;

  this.greatherThan = function (other) {
    if (this.isOk && this.value <= other) {
      this.isOk = false;
    }

    return this;
  };

  this.greatherEqualThan = function (other) {
    if (this.isOk && this.value < other) {
      this.isOk = false;
    }

    return this;
  };

  this.lessThan = function (other) {
    if (this.isOk && this.value >= other) {
      this.isOk = false;
    }

    return this;
  };

  this.lessEqualThan = function (other) {
    if (this.isOk && this.value > other) {
      this.isOk = false;
    }

    return this;
  };

  this.between = function (left,right) {
    this.greatherEqualThan(left);
    this.lessEqualThan(right);
    
    return this;
  };

  this.defined = function () {
    if (this.isOk && !this.value) {
      this.isOk = false;
    }

    return this;
  };

  this.present = this.defined;

  this.asDate = function (converter) {
    if (this.value) {
      converter = converter || function (val) { return new Date(val) };

      this.value = converter(this.value);
    }

    return this;
  };

  this.report = function(message) {
    if (!this.isOk) {
      this.errorsOwner._vf_errors[label] = message;
    }
  };
}

function CustomFunctionValidation(customFunction, errorsOwner) {
    this.otherwise = this;
    this.report = function(message) {
      if (!errorsOwner._vf_errors.messages) {
        errorsOwner._vf_errors.messages = [];
      }

      if (!customFunction()) {
        errorsOwner._vf_errors.messages.push(message);
      }
    }
  }

function validationFramework(target, errorsOwner) {
  // verifies if the target is defined.
  // This helps to evolve middleware version
  if (target) {
    if (!errorsOwner._vf_errors) {
      errorsOwner['_vf_errors'] = {};
    }
    
    errorsOwner.errors = function () {
      return this._vf_errors;
    };

    errorsOwner.hasErrors = function () {
      return Object.getOwnPropertyNames(this._vf_errors).length > 0;
    };

    target.checkIf = function (label) {
      return new Validator(label, target, errorsOwner);
    };

    target.checkIfIsValid = function(customFunction) {
      return new CustomFunctionValidation(customFunction, errorsOwner);
    };
  }
}

exports.dacValidation = function dacValidation(request,response,next) {
  validationFramework(request.params, request);
  validationFramework(request.body, request);
  validationFramework(request.query, request);

  return next();
}